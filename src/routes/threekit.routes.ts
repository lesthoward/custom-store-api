import express, { Router } from 'express';
import { createDatatable } from '../controllers/datatable.controller';

const router: Router = express.Router();

router.post('/create-datatable', createDatatable);

export { router as threekitRoutes };
