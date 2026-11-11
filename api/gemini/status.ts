import { msg } from '../../server/helloMod';
export default function handler(req: any, res: any) { res.status(200).json({ ok: true, msg, url: req.url }); }
