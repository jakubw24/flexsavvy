# Manual Actions and Decision Gates — Fresh start Project

The coding agent must not make these decisions or perform them without explicit user action.

## Before public beta
- Choose final brand, domain and legal entity.
- Create the support email.
- Obtain permission for every private validation dataset.
- Keep private datasets outside the public repository.
- Reconcile calculations against real supplier bills.
- Review tariff eligibility wording and every public savings claim.
- Test on real phones and desktop browsers.
- Review privacy and terms text.
- Decide whether ICO registration or a DPIA applies to the final model.
- Choose payment and affiliate providers only after validating demand.
- Confirm hosting, backup and rollback access.

## Validation datasets
Obtain legitimate examples of:
- full-year import-only data;
- n3rgy data;
- Octopus JSON or CSV;
- solar import/export data;
- an EV household;
- a battery household;
- both UK DST transitions;
- matching supplier bills.

## No-go conditions
Do not publish strong annual savings or payback claims until:
- at least 300 days are represented;
- coverage is at least 90%;
- timestamp ambiguities are resolved;
- tariffs cover the simulated period;
- billing has been reconciled against real bills;
- assumptions and warnings are visible.

## Old repository boundary

Because this is a fresh start:

- do not point the new project at the old repository remote;
- do not copy old source modules wholesale;
- do not import old Git history;
- use the old project only as a human reference when explicitly authorised;
- validate every new result independently.
