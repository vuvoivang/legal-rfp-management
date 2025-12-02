import express from 'express';
import { createRfp, deleteRfp, getRfps, updateRfp } from '../controllers/rfpController';


const router = express.Router();

router.get('/', getRfps);
router.post('/', createRfp);
router.put('/:id', updateRfp);
router.delete('/:id', deleteRfp);


export default router;
