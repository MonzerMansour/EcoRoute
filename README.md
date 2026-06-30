# EcoRoute — Creator Colosseum Startup Competition Submission

[EcoRoute Live Website](https://ecoroute-app-nu.vercel.app/)

## 1. Written Description of the Startup Idea

EcoRoute is an AI-assisted transportation platform that helps schools cut travel emissions without changing a single bell schedule, bus contract, or practice time. It gives coaches and athletic directors a tool to pick the lowest-emission vehicle mix for away games, and gives families a privacy-safe way to find carpool partners for daily commutes and home games, all powered by one shared emissions engine so a coach's season report and a family's daily commute are measured on the same scale.

Unlike general rideshare or "kid Uber" services, EcoRoute doesn't sell rides, it sells better decisions about the rides schools and families are already taking.

## 2. The Problem, and Why It Matters

Transportation is the single largest source of U.S. greenhouse gas emissions, ahead of every other sector of the economy. Schools sit at the center of this problem and have almost no tools to manage it:

- Nearly 500,000 diesel-burning school buses move about 20 million students every day, and most of that fleet still runs on fossil fuel, so every away-game and field-trip decision has a real emissions cost that nobody is measuring.
- Coaches and activity directors currently choose buses vs. vans vs. carpools based on convenience or habit, not on which option actually produces less CO₂ for that specific roster and distance.
- Families who want to carpool have no easy, privacy-safe way to find a nearby match. Existing carpool apps (GoKid, Piggyback Network) and paid kid-rideshare services (HopSkipDrive, Zum, Alto) all solve "get my kid a ride," but none of them tell a school what its total transportation footprint is or how to lower it, and none of them optimize team/event travel at all.

That's the gap EcoRoute fills: nobody currently sits at the intersection of (1) event-travel vehicle optimization and (2) daily-commute carpool matching, unified under one emissions number a school can actually track season over season.

**Why now:** Federal Clean School Bus Program funding has put school transportation emissions on districts' radar for the first time, but the program's direction has become politically contested and inconsistently funded, which means districts can't count on fleet electrification alone to solve this and need software-side tools, like a vehicle and carpool optimizer, that cut emissions today regardless of which way federal funding moves.

*Sources: EPA, "Fast Facts on Transportation Greenhouse Gas Emissions"; World Resources Institute, Electric School Bus Initiative.*

## 3. The Solution and How It Works

EcoRoute runs two connected dashboards on one shared emissions engine.

### Coordinator Dashboard (coaches, athletic directors, club staff)

A coach enters an away-event's location, distance, roster size, and available vehicles. The Trip Vehicle Optimizer evaluates every realistic vehicle configuration, one bus, two vans, a mix of carpools, etc., calculates the CO₂ for each using EPA emissions factors and real fleet fuel-economy numbers (bus ≈ 7 mpg, van ≈ 18 mpg, carpool ≈ 28 mpg), and recommends the lowest-emission option with a plain-language explanation of why it wins. Across a season, every trip rolls up into a Season Emissions Dashboard showing total footprint, highest-impact changes, and year-over-year progress.

### Student & Parent Dashboard

Families enter a ZIP code and neighborhood (never an exact address) along with commute method and available seats. EcoRoute matches nearby families into carpool clusters, lets students track CO₂ saved, and shows the environmental impact of each event they're attending. A commute simulator shows students how small changes (sharing a ride twice a week, for example) add up.

### Shared Emissions Engine

Both dashboards draw on the same underlying logic, EPA CO₂ constants, fleet MPG estimates, and configuration-ranking math, so a coach's season number and a family's daily commute number are directly comparable, which is what lets a school report one unified footprint instead of two disconnected ones.

### Privacy & Safety (built for a minor user base)

No exact home addresses are ever collected; carpool matching uses ZIP + neighborhood only; any contact information is shared only after a group is finalized and both families opt in; and every final carpool or vehicle assignment requires human approval, the AI recommends, a parent, student, or coach always decides.

### What's already built

[EcoRoute Link](https://ecoroute-app-nu.vercel.app/)

EcoRoute is live today at the link above, with separate working login flows for teachers and students, a season emissions report generator, and a carpool-cluster map; this is a functioning product, not a mockup.

## 4. Execution / Business Plan

### Phased Rollout

| Phase | Timeline | Focus | Milestones |
|-------|----------|-------|------------|
| **1 — Pilot** | 0–3 months | 2–3 partner schools; validate optimizer & carpool clustering | 200+ student users, 20+ optimized trips, baseline emissions number established |
| **2 — District rollout** | 3–9 months | Multi-school sustainability reporting, parent/driver portal, paid coordinator tier launches | 5–10 schools, 1 district partnership, 15% reduction in trip vehicle-miles |
| **3 — Scale** | 9–18 months | Mobile app, opt-in precise mapping (Google Maps API), district-wide analytics | 50+ schools, 3 district contracts |

### Revenue Model (proposed launch pricing)

- **School tier:** flat annual subscription for the coordinator dashboard + season reporting (target range: $400–$900/school/year, priced to undercut what districts already pay for ad hoc rideshare or routing software).
- **District analytics add-on:** aggregated, multi-school sustainability dashboards for district sustainability offices.
- **Free tier:** the student/parent carpool dashboard stays free, since network effects (more families = better carpool matches) matter more than direct revenue there.
- **Future consulting:** district-level sustainability reporting support once EcoRoute has enough season-over-season data to be credible.

**Unit economics, in plain terms:** marginal cost to serve one additional school is close to zero, it's a Gemini API call per trip explanation plus serverless hosting, both usage-based, so at the proposed $400–$900/year price point, a single school covers its own hosting and AI costs many times over within the first month, which is what makes the per-school model sustainable even before any district contract closes. The real cost driver isn't compute, it's the human time to onboard a school's roster and fleet data, which is why Phase 1 deliberately caps at 2–3 pilot schools instead of trying to scale onboarding before it's been done by hand once.

**Why now:** School transportation sustainability has moved onto district agendas at a scale it wasn't a few years ago, largely because of federal Clean School Bus Program funding, but that funding is aimed at buying new buses, not at measuring or managing the trips schools are already taking. That leaves an open, low-cost lane: EcoRoute doesn't require a single capital purchase or a new bus order to produce a measurable emissions-reduction number, which makes it a realistic first step for a district before, or instead of, a multi-year fleet investment.

### Competitive Landscape: Why EcoRoute, not an existing tool

| Competitor | What they do | What they don't do |
|------------|--------------|--------------------|
| **GoKid** | Parent-to-parent carpool matching for daily commute, already tracks CO₂ saved at the school level | No team/event travel optimization, no per-trip vehicle-configuration math for coaches |
| **HopSkipDrive / Zum / Alto** | Paid, vetted driver networks that solve the "no bus driver" problem | Built for safety and on-demand reliability, not emissions; not free; not built for season-level sustainability reporting |
| **Waze Carpool / Uber/Lyft Share** | General-purpose ride matching | Not school-specific, no privacy design for minors, no emissions reporting at all |

**EcoRoute's actual edge:** it's the only product that puts a coach's vehicle decision and a family's carpool decision on the same emissions ledger. That's a genuinely open lane, closing it before a competitor does (GoKid is the closest and best-funded threat) is the real strategic risk worth naming honestly.

## 5. Target Users and Market

**Who are your target users or market?**

EcoRoute serves three tiers of users, anchored by one core buyer.

- **Primary users** are athletic directors, coaches, and club coordinators who plan away-event travel and currently choose vehicles by habit, with no data behind the decision. EcoRoute allows every away trip to become logged, adds comparable emissions decisions, and a full season of those decisions becomes a single number a school can report and improve year over year. That reportable number is the product's core value, because a school cannot reduce a footprint it has never measured.
- **Secondary users** are students and parents who want a safe, privacy-respecting way to carpool for daily commutes and home games. This side compounds the impact and drives the network effect, since more participating families mean better carpool matches.
- **Tertiary buyers** are district administrators responsible for sustainability or operations, who today can only cut transportation emissions by buying expensive electric buses. EcoRoute gives them a measurable emissions number to report for a fraction of that cost.

**Market size:** There are over 130,000 K–12 schools in the U.S., the large majority of which run organized athletics and activity travel and have no emissions-tracking tool today. Even a modest foothold, a few hundred schools at the proposed per-school pricing, represents a realistic, defensible early revenue base without needing district-wide contracts to be viable.
