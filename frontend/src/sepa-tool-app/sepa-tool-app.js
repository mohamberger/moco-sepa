import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import 'netlify-identity-widget';

import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-spinner/paper-spinner';
import '@polymer/paper-item/paper-icon-item';
import '@polymer/paper-item/paper-item-body';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-pages/iron-pages';

/**
 * @customElement
 * @polymer
 */
class SepaToolApp extends PolymerElement {
    static get template() {
        return html`
            <style>
                :host {
                    max-width: 500px;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                    justify-content: center;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji";
                }
                
                .avatar {
                    background: #efefef;
                    border-radius: 50%;
                    height: 40px;
                    width: 40px;
                }
                
                h1 {
                    text-align: center;
                }
                
                paper-card {
                    width: 100%;
                    margin-bottom: 20px;
                }
                
                .spinner {
                    display: flex;
                    height: 72px;
                    align-items: center;
                    justify-content: center;
                }
                
                [hidden] {
                    display: none;
                }
                
                paper-button {
                    background-color: #38b5eb;
                    color: #fff;
                    margin: 0;
                    width: 100%;
                }
            </style>
            
            <h1>SEPA Export</h1>
            
            <iron-pages selected="[[page]]" attr-for-selected="page">
                <div page="login">
                    <paper-button raised on-tap="login">Login</paper-button>
                </div>
                
                <div page="list">
                    <paper-card heading="Available Transactions">
                        <div class="spinner" hidden$="[[!loading]]">
                            <paper-spinner active></paper-spinner>
                        </div>
                        <div class="transactions">
                            <template is="dom-repeat" items="[[transactions]]">
                                <paper-icon-item>
                                    <img class="avatar" slot="item-icon" src="[[item.image]]" alt="Customer Avatar">
                                    <paper-item-body two-line>
                                        <div>[[item.title]]</div>
                                        <div secondary>[[item.debtor_name]] &middot; [[item.total]] €</div>
                                    </paper-item-body>
                                    <paper-icon-button icon="open-in-new" alt="Open invoice in MOCO" on-tap="openInvoice"></paper-icon-button>
                                </paper-icon-item>
                            </template>
                        </div>
                    </paper-card>
                    
                    <paper-button raised on-tap="downloadXml">Download SEPA XML file</paper-button>
                </div>
            </iron-pages>
        `;
    }

    static get properties() {
        return {
            transactions: {
                type: Array,
                value: () => []
            },
            loading: {
                type: Boolean,
                value: true
            },
            page: {
                type: String,
                value: 'login'
            }
        };
    }

    openInvoice(e) {
        window.open(e.model.get('item.link'));
    }

    downloadXml() {
        window.open('/api/getSepaXml');
    }

    login() {
        netlifyIdentity.open('login');
    }

    async loadList() {
        const user = await netlifyIdentity.currentUser();
        if(!user) {
            return;
        }

        const results = await (await fetch('/api/getSepaTransfers', {headers: {
            "Authorization": `Bearer ${await user.jwt()}`,
        }})).json();
        this.loading = false;

        if(results.error) {
            alert(results.error);
            return;
        }

        this.transactions = results;
    }

    async ready() {
        super.ready();

        const handleLogin = user => {
            console.log(user);

            if(user) {
                this.page = 'list';
                this.loadList();
            }
        };

        netlifyIdentity.on("init", handleLogin);
        netlifyIdentity.on("login", handleLogin);

        netlifyIdentity.init();
    }
}

window.customElements.define('sepa-tool-app', SepaToolApp);
