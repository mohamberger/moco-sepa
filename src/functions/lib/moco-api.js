import fetch from './paginated-fetch';
import SEPA from 'sepa';
import gravatar from 'node-gravatar';
import crc32 from 'crc-32';

require('dotenv').config();

async function mocoRequest(url, params, method = 'GET') {
    console.log('Request to', url);

    return (await fetch(`https://${process.env.MOCO_WORKSPACE}.mocoapp.com/api/v1/${url}`, {
        method,
        headers: {
            'Authorization': `Token token="${process.env.MOCO_TOKEN}"`
        }
    })).data;
}

function parseDate(input) {
    if(!input) {
        throw new Error(`Invalid date: ${input}!`);
    }

    if(input.indexOf("-") !== -1) {
        return new Date(input);
    }

    const parts = input.match(/(\d+)/g);
    return new Date(parts[2], parts[1]-1, parts[0]);
}

export async function getSepaTransfers() {
    const [invoices, projects] = await Promise.all([
        mocoRequest('invoices/?status=sent'),
        mocoRequest('projects?include_company=true')
    ]);

    return (await Promise.all(invoices.map(async i => {
        const project = projects.filter(p => p.id === i.project_id)[0];

        if(!project) {
            return;
        }

        if (
            !project ||
            !project.custom_properties['Zahlbar per'] ||
            project.custom_properties['Zahlbar per'] !== 'Lastschrift'
        ) {
            return;
        }

        const customer = project.customer;

        return {
            id: i.id,
            title: i.title,
            total: i.gross_total,
            date: i.date,
            due_date: parseDate(i.due_date),
            identifier: i.identifier,
            iban: customer.custom_properties['IBAN'],
            bic: customer.custom_properties['BIC'],
            debtor_name: customer.custom_properties['Kontoinhaber'],
            mandate_reference: customer.custom_properties['Mandatsreferenz'],
            mandate_date: parseDate(customer.custom_properties['Eingangsdatum des Mandates']),
            project_id: i.project_id,
            customer_id: i.customer_id,
            link: `https://${process.env.MOCO_WORKSPACE}.mocoapp.com/invoices/${i.id}`,
            image: gravatar.get(customer.email || Math.random().toString(), 'r', '80', 'mp')
        }
    }))).filter(i => i);
}

export async function getSepaXml() {
    const transfers = (await getSepaTransfers());
    const sepaDocument = new SEPA.Document('pain.008.001.02');
    sepaDocument.grpHdr.id = `DM.${crc32.str(transfers.map(t => t.id).join()).toString(16).substr(1)}`;
    sepaDocument.grpHdr.created = new Date();
    sepaDocument.grpHdr.initiatorName = process.env.CREDITOR_NAME;

    const info = sepaDocument.createPaymentInfo();
    info.collectionDate = new Date(Date.now() + (1000 * 60 * 60 * 24 * (process.env.COLLECTION_DAYS || 14)));
    info.creditorIBAN = process.env.CREDITOR_IBAN;
    info.creditorBIC = process.env.CREDITOR_BIC;
    info.creditorName = process.env.CREDITOR_NAME;
    info.creditorId = process.env.CREDITOR_ID;
    sepaDocument.addPaymentInfo(info);

    for(let s of transfers) {
        const tx = info.createTransaction();
        tx.debtorName = s.debtor_name;
        tx.debtorIBAN = s.iban;
        tx.debtorBIC = s.bic;
        tx.mandateId = s.mandate_reference;
        tx.mandateSignatureDate = s.mandate_date;
        tx.amount = s.total;
        tx.remittanceInfo = s.identifier;
        tx.id = `${s.mandate_reference}.${s.remittanceInfo}`;
        tx.end2endId = `${s.mandate_reference}.${s.remittanceInfo}`;
        info.addTransaction(tx);
    }

    return sepaDocument;
}