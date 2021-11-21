- [ ] create tests
- [ ] prune dependencies
- [×] seed database with TLDs
- [ ] figure out pricing for TLDs and premium SLDs
- [ ] create payments database
  - [ ] support mobilecoin
  - [ ] support legacy (Stripe)
  - [ ] support btc
  - [ ] support hns
  - [ ] support eth

## Thoughts

- registrar api connects to registry api, to get list of TLDs it has contracts for
- wholesale price is included in the response, so registrar can add markup



## Why be a registrar when Neuenet is a registry with its own registrar? How can I compete on price?

There is no way you can compete on price, as registry and registrar have the same owner. However, what you can do is specialize and provide more services to make purchasing from your registrar a lot more appealing than ours. Here are some examples:

### Example 1

You run a restaurant or even a chain, and you have an idea to start a social network around food in general. Your restaurant, Patty's, runs the domains `pattys.lunch/`, `pattys.dinner/`, and `pattys.brinner/`. You want your fans to feel a closer connection to and ownership of Patty's success, so you create a registrar to handle domain registrations and tailor the experience of domain purchasing.

Nothing is stopping your influencers from purchasing their own `lunch/`, `dinner/` and `brinner/` domains from beachfront/ and tying them to their Patty's account. However, beachfront/ is a general registrar with hundreds of domains to appeal to a wide audience. There is no way beachfront/ can compete with Patty's focus on their own bubble.

Patty's can:

- send regular deals to their customers
- send notifications about upcoming launches ahead of the general public


