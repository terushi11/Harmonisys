import admin, { ServiceAccount } from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

interface FullServiceAccount extends ServiceAccount {
    type?: string;
    project_id?: string;
    private_key?: string;
    private_key_id?: string;
    client_email?: string;
    client_id?: string;
    auth_uri?: string;
    token_uri?: string;
    auth_provider_x509_cert_url?: string;
    client_x509_cert_url?: string;
    universe_domain?: string;
}

const IRSConfig = {
    apiKey: process.env.IRS_API_KEY,
    authDomain: process.env.IRS_AUTH_DOMAIN,
    projectId: process.env.IRS_PROJECT_ID,
    storageBucket: process.env.IRS_STORAGE_BUCKET,
    messagingSenderId: process.env.IRS_MESSAGING_SENDER_ID,
    appId: process.env.IRS_APP_ID,
};

const IRSApp = initializeApp(IRSConfig);
const IRSdb = getFirestore(IRSApp);

const MISALUDConfig: FullServiceAccount = {
    type: process.env.MISALUD_TYPE,
    project_id: process.env.MISALUD_PROJECT_ID,
    private_key_id: process.env.MISALUD_PRIVATE_KEY_ID,
    private_key: process.env.MISALUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.MISALUD_CLIENT_EMAIL,
    client_id: process.env.MISALUD_CLIENT_ID,
    auth_uri: process.env.MISALUD_AUTH_URI,
    token_uri: process.env.MISALUD_TOKEN_URI,
    auth_provider_x509_cert_url:
        process.env.MISALUD_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.MISALUD_CLIENT_X509_CERT_URL,
    universe_domain: process.env.MISALUD_UNIVERSE_DOMAIN,
};

// Mi Salud (Admin SDK)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(MISALUDConfig),
    });
}

const MISALUDdb = admin.firestore();

export { IRSdb, MISALUDdb };
