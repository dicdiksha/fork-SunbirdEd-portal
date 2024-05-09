'use strict'
const env = process.env
const fs = require('fs')
const packageObj = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const __envIn = "staging";
const SB_DOMAIN = 'https://dev.oci.diksha.gov.in'
let envVariables = {
APPID: process.env.sunbird_environment + '.' + process.env.sunbird_instance + '.portal',
sunbird_instance_name: 'diksha',
PORTAL_API_WHITELIST_CHECK: 'true',
PORTAL_SESSION_SECRET_KEY: (env.sunbird_portal_session_secret && env.sunbird_portal_session_secret !== '')
? env.sunbird_portal_session_secret.split(',') : 'sunbird,ed48b0ce-5a92-11ed-9b6a-0242ac120002'.split(','),
PORTAL_PORT: 3000,
PORTAL_SESSION_STORE_TYPE: 'redis',
PORTAL_CASSANDRA_CONSISTENCY_LEVEL: 'quorum',
DEFAULT_TENANT: 'sunbird',
DEFAULT_CHANNEL: 'ntp',
sunbird_default_language: 'en',
TENANT_CDN_URL: '',
CONTENT_EDITORS_URL: {
  COLLECTION_EDITOR: 'collection-editor/index.html',
  CONTENT_EDITOR: 'content-editor/index.html',
  GENERIC_EDITOR: 'generic-editor/index.html'
},
sunbird_cloud_storage_provider: 'oci',
PORTAL_CASSANDRA_REPLICATION_STRATEGY:'{"class":"NetworkTopologyStrategy","datacenter1":2}',
//KONG
KONG_DEVICE_REGISTER_ANONYMOUS_TOKEN: "false",
KONG_DEVICE_REGISTER_TOKEN: 'true',
sunbird_kong_refresh_token_api: 'https://dev.oci.diksha.gov.in/auth/v1/refresh/token',
sunbird_anonymous_device_register_api:
'https://dev.oci.diksha.gov.in/api-manager/v2/consumer/portal_anonymous/credential/register',
// Azure
sunbird_azure_account_name: 'ebd75cc5b2f230063d7e2db915b62c809bd3be80',
sunbird_azure_account_key: 'PY+ufXWrcsimfvxKY26g/KC3Wx27Zck2zGj6ecNSG6k=',
sunbird_azure_report_container_name: 'reports',
sunbird_azure_resourceBundle_container_name: 'dev-label-storage',
//Keycloak
KEYCLOAK_GOOGLE_ANDROID_CLIENT: {
clientId: 'clientId',
secret: 'secret'
},
KEYCLOAK_GOOGLE_IOS_CLIENT: {
clientId: 'clientId',
secret: 'secret'
},
KEYCLOAK_GOOGLE_DESKTOP_CLIENT: {
clientId: 'clientId',
secret: 'secret'
},
KEYCLOAK_TRAMPOLINE_ANDROID_CLIENT: {
clientId: 'clientId',
secret: 'secret'
},
KEYCLOAK_TRAMPOLINE_DESKTOP_CLIENT: {
clientId: 'clientId',
secret: 'secret'
},
KEYCLOAK_ANDROID_CLIENT: {
clientId: 'android',
},
KEYCLOAK_GOOGLE_CLIENT: {
clientId: "google-auth",
secret: "2bbdd3e0-dfd1-4b88-ab6a-8f1a0c659ab0",
},
//Urls
PORTAL_REALM: 'sunbird',
PORTAL_AUTH_SERVER_URL: SB_DOMAIN + '/auth',
PORTAL_AUTH_SERVER_CLIENT: 'portal',
REPORT_SERVICE_URL: SB_DOMAIN + '/api/data/v1/report-service',
CONTENT_URL: SB_DOMAIN + '/api/',
DATASERVICE_URL: SB_DOMAIN + '/api/',
discussions_middleware: 'https://discussionsmw-service:3002',
uci_service_base_url: 'https://dev.oci.diksha.gov.in',
LEARNER_URL: SB_DOMAIN + '/api/',
learner_Service_Local_BaseUrl: 'https://learner-service:9000',
TELEMETRY_SERVICE_LOCAL_URL: 'https://telemetry-service:9001/',
CONTENT_PROXY_URL: SB_DOMAIN,
PORTAL_EXT_PLUGIN_URL: 'https://player_player:3000/plugin/',
CONTENT_SERVICE_UPSTREAM_URL: 'https://localhost:5000/',
LEARNER_SERVICE_UPSTREAM_URL: 'https://localhost:9000/',
content_Service_Local_BaseUrl: 'https://content_service_content_service:5000',
sunbird_device_api: SB_DOMAIN + '/api/',
sunbird_kid_public_key_base_path: '/keys/',
sunbird_data_product_service: SB_DOMAIN,
// logged in user configs
sunbird_loggedin_device_register_api:
'https://dev.oci.diksha.gov.in/api-manager/v2/consumer/portal_loggedin/credential/register',
//TTL
sunbird_anonymous_session_ttl: 10 * 60 * 1000,
sunbird_session_ttl:24 * 60 * 60 * 1000,
//Cache config
CACHE_STORE: "memory",
CACHE_TTL: 1800,
//Healthcheck flags
sunbird_portal_health_check_enabled: "true",
sunbird_learner_service_health_status: "true",
sunbird_content_service_health_status: "true",
sunbird_portal_cassandra_db_health_status: "true",

//Redis

PORTAL_REDIS_URL: env.sunbird_redis_urls || 'redis',
PORTAL_REDIS_PORT: env.sunbird_redis_port || '6379',
PORTAL_REDIS_TYPE: env.sunbird_redis_type || 'standalone' ,
PORTAL_REDIS_PASSWORD: env.sunbird_redis_password || '',
PORTAL_REDIS_CONNECTION_STRING: env.portal_redis_connection_string || 'redis://:@10.50.15.24/3',

// OCI - Oracle Cloud Infrastructure
sunbird_oci_access_key: env.cloud_private_storage_accountname || 'ebd75cc5b2f230063d7e2db915b62c809bd3be80',
sunbird_oci_secret_key: env.cloud_private_storage_secret || 'PY+ufXWrcsimfvxKY26g/KC3Wx27Zck2zGj6ecNSG6k=',
sunbird_oci_region: env.cloud_private_storage_region || 'ap-mumbai-1',
sunbird_oci_reports: env.cloud_storage_privatereports_bucketname || 'dev-privatereports-storage',
sunbird_oci_labels: env.cloud_storage_resourceBundle_bucketname || 'dev-label-storage',
sunbird_oci_endpoint: env.cloud_private_storage_endpoint || 'https://bmzbbujw9kal.compat.objectstorage.ap-mumbai-1.oraclecloud.com',

// Keys
KONG_DEVICE_REGISTER_AUTH_TOKEN:
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJNZXI4RWplMW0yMFB5cXpISWljM2tUM3FraVZoWmZXRSJ9.3M23YKULRjFWW9NkbZQQgq1-_BaIVcsUh-Cr3PkHG54',
sunbird_anonymous_default_token:
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJoS2o2QW1UeGg3a2tlWEFLemI0QzdxUTIzWGY3cngzUCJ9.trMo3rYFu0l9oi8HUnBlGjAf9orIEz4zPzJkJvc8zag',
sunbird_anonymous_register_token:
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ3dldGNG9SWGFnc3NDNWEwNWVqQ3M0WXNkZzlCaklNWCJ9.z6Zac-H3uax_Sw9l9IGCL24LiLvTzleBHrNzVoN3fOU',
sunbird_loggedin_register_token:
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJtY253MGZzSHBJdkFHWW5KSzZkRmhDaHoyeDYxREVaayJ9.BKvy7bmqMwSS9p8fjT9nJqaOtLzUfz8PdVxnENkuJO0',
sunbird_logged_default_token:
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI3VUFmOEpTNHRYeWNpOHBTSHBxSlExdnFreldvTUZuMSJ9.AYKrEu-QnHeSj8--KGTg9O7bUQO2x8ISbkZTRwQAP2E',
PORTAL_API_AUTH_TOKEN:
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJtY253MGZzSHBJdkFHWW5KSzZkRmhDaHoyeDYxREVaayJ9.BKvy7bmqMwSS9p8fjT9nJqaOtLzUfz8PdVxnENkuJO0',

PHRASE_APP: {
  phrase_authToken: env.sunbird_phraseApp_token || '',
  phrase_project: env.phrase_project || 'DIKSHA Portal,Sunbird Creation',
  phrase_locale: env.phrase_locale || ['en-IN', 'bn-IN', 'hi-IN', 'kn-IN', 'mr-IN', 'ur-IN', 'te-IN', 'ta-IN'],
  phrase_fileformat: env.phrase_fileformat || 'json'
},
}
envVariables.PORTAL_CASSANDRA_URLS = '10.50.9.246:9042,10.50.8.60:9042';
// Path to dev config file
const devConfig = __dirname + '/devConfig.js';
try {
// If environment is `local`; use custom config
// Else default config will be used
if (process.env.sunbird_environment === 'local' && fs.existsSync(devConfig)) {
const devVariables = require('./devConfig');
module.exports = devVariables;
// console.log('local---->',devVariables);
} else {
module.exports = envVariables;
// console.log('env---->',envVariables);
}
} catch (error) {
module.exports = envVariables;
// console.log('errorEnv---->',envVariables);
}