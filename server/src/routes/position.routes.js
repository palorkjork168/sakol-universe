const express = require("express");
const positionController = require("../controllers/position.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");
const validate = require("../middleware/validate.middleware");
const { positionSchema } = require("../validators/position.validator");

const router = express.Router();

router.use(authenticate);

router.get("/company/:companyId", positionController.getCompanyPositions);
router.get("/department/:departmentId", positionController.getDepartmentPositions);

router.post(
  "/",
  authorize("EMPLOYER", "ADMIN", "HR"),
  validate(positionSchema),
  positionController.createPosition
);

router.put(
  "/:id",
  authorize("EMPLOYER", "ADMIN", "HR"),
  validate(positionSchema),
  positionController.updatePosition
);

router.delete(
  "/:id",
  authorize("EMPLOYER", "ADMIN", "HR"),
  positionController.deletePosition
);


module.exports = router;
