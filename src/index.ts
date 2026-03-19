import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import 'dotenv/config'
import detectRoute from "./routes/detection.route.js";
import articleRoute from "./routes/article.route.js";
import articlesRoute from "./routes/articles.route.js";
import {authMiddleware} from "./middlewares/auth.middleware.js";

const app = new Hono()

app.use('*', authMiddleware)

app.route('/detect', detectRoute)
app.route('/article', articleRoute)
app.route('/articles', articlesRoute)

serve({ fetch: app.fetch, port: 3000},() => {
  console.log(`Server is running on http://localhost:3000`)
})
