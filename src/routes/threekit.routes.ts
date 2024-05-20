import express, { Router } from 'express';
import { createDatatableHandler } from '../controllers/datatable.controllers';

const router: Router = express.Router();

router.post('/create-datatable', createDatatableHandler);

export { router as threekitRoutes };
