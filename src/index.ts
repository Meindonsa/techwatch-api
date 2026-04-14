import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import 'dotenv/config'
import detectRoute from "./routes/detection.route.js";
import articleRoute from "./routes/article.route.js";
import articlesRoute from "./routes/articles.route.js";
import {authMiddleware} from "./middlewares/auth.middleware.js";
import {rateLimitMiddleware} from "./middlewares/rate-limit.middleware.js";
import {swaggerUI} from "@hono/swagger-ui";
import {openApiDoc} from "./openapi.js";
import { cors } from "hono/cors";
import {runMigrations} from "./db/index.js";
import userRoute from "./routes/user.route.js";
import feedRoute from "./routes/feed.route.js";

runMigrations()
const app = new Hono()
app.use('*', cors())

//app.use('*', ssrfMiddleware)
app.use('/detect/*', authMiddleware)
app.use('/article/*', authMiddleware)
app.use('/articles/*', authMiddleware)
app.use('/users/*', authMiddleware)
app.use('/feeds/*', authMiddleware)
app.use('*', rateLimitMiddleware)

app.route('/detect', detectRoute)
app.route('/article', articleRoute)
app.route('/articles', articlesRoute)
app.route('/users', userRoute)
app.route('/feeds', feedRoute)

app.get('/doc', (c) => c.json(openApiDoc))
app.get('/ui', swaggerUI({ url: '/doc' }))

serve({ fetch: app.fetch, port: 3000},() => {
  console.log('Server running on http://localhost:3000')
  console.log('Swagger UI → http://localhost:3000/ui')
})
