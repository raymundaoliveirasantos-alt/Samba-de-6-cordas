import app from '../../server/vercelApp';
export default function handler(req: any, res: any) { return app(req, res); }
