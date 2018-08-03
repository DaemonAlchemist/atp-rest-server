
import uac from 'atp-rest-uac';
import media from 'atp-rest-media';
import comic from 'atp-rest-comic';
import tag from 'atp-rest-tag';
import cms from 'atp-rest-cms';
import {o} from 'atp-sugar';

const localHost = o({
    server: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASS
});

export default {
    modules: [uac, media, comic, tag, cms],
    config: {
        mysql: {
            connection: {
                default: localHost.merge({ database: process.env.DB_SCHEMA }).raw
            }
        },
        media: {
            aws: {
                region: process.env.AWS_REGION,
                bucket: process.env.MEDIA_AWS_BUCKET,
                staticHost: process.env.MEDIA_AWS_STATIC_HOST
            }
        }
    }
};