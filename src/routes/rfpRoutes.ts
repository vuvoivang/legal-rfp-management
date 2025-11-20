import express from 'express';
import { createRfp, deleteRfp, getRfps, updateRfp } from '../controllers/rfpController';


const router = express.Router();

router.get('/rfps', getRfps);
router.post('/rfps', createRfp);
router.put('/rfps/:id', updateRfp);
router.delete('/rfps/:id', deleteRfp);


export default router;
