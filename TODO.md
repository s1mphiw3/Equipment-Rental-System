# TODO - Remove Email Verification Requirement

- [ ] Backend: remove `email_verified` blocking check from `authController.login`
- [ ] Backend: update `authController.register` response to allow immediate login (success message + `email_verified: true`)
- [ ] Frontend: remove “Verify Email” button/flow from `Login.jsx` so login does not require verification
- [ ] Frontend: ensure `Register.jsx` doesn’t display “check your email” messaging (verify and adjust if present)
- [ ] Smoke test: register + login works immediately (2FA flow unchanged)

