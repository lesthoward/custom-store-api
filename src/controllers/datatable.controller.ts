import { Request, Response } from 'express';

export const createDatatable = (req: Request, res: Response) => {
    console.info('req.query', req.query);
    res.send('ok');
};
