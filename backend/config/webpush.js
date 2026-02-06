const webpush = require('web-push');
require('dotenv').config();

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BN3RRVirWD-_wZXwwM9Ss-fMaBOQQwoQxcpXK2EKyygM_x3A19MVbzz3VfuX2GgEwpUPGc0_81vBh18liJY2qsY';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'nOvD_QoKKOsv7keQrYjnks8K_QA-0YX7mQ-yjV8Wi-o';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:gowthamprofessionalacc@gmail.com';

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

module.exports = webpush;
