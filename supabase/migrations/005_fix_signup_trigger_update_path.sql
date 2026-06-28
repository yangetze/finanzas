-- GoTrue sometimes UPDATEs auth.users (sets email_confirmed_at) instead of re-INSERTing
-- when a user clicks a magic link on a second+ OTP attempt for the same email.
-- The original INSERT-only trigger never fires in that path, leaving the user out of public.users.
-- Adding an UPDATE trigger that fires when email_confirmed_at transitions NULL → NOT NULL.

DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL)
  EXECUTE FUNCTION public.handle_new_user();
