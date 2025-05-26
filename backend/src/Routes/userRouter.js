const router = require("express").Router();
const {
  signup,
  signin,
  getActivity,
  addToActivity,
  createMeeting,
  joinMeeting,
} = require("../controllers/userController");
const { userVerification } = require("../Middlewares/Authentication");

router.post("/", userVerification);
router.post("/signup", signup);
router.post("/signin", signin);
router.get("/getActivity", getActivity);
router.post("/addToActivity", addToActivity);
router.post("/createMeeting", createMeeting);
router.post("/joinMeeting", joinMeeting);
module.exports = router;
