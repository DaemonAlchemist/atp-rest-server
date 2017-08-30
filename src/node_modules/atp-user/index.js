/**
 * Created by Andy on 8/25/2017.
 */

import userRoutes from './routes/user';
import loginRoutes from "./routes/login";
import validators from "./validators/index";

export default ({
    routes: {
        user: userRoutes,
        login: loginRoutes,
    },
    config: {
        validators
    }
});
