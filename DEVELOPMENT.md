# Development Tips

This document contains some tips about cockpit-wicked's development. Please,
note that we are not React or JavaScript expert developers, so we are open to
any suggestion about improving the current approach.

## Architecture

Be it realistic or not, the idea is to organize the code so that it can be
extended in the future to support other backends apart from Wicked. With that
idea in mind, we can identify these pieces:

* A User Interface built with React. Components live under `src/components` and
  [React contexts](https://en.reactjs.org/docs/context.html) are defined in
  `src/context` (see the next section for further information).
* A data model (`lib/model`) defines concepts like interfaces, connections,
  routes, etc. They are just plain JavaScript objects that are created using a
  set of factory functions.
* A `NetworkClient` class that offers an API to interact with the networking
  service. This class relies on *adapters* to do the real work, so we could
  write adapters for other backends in the future.
* The Wicked adapter (`src/lib/wicked`) contains Wicked's specific code.

## The Network Context

[React v16.3.0](https://reactjs.org/blog/2018/03/29/react-v-16-3.html)
introduced the *context API* (it was already there, but it was considered
*experimental*), making it easier to pass data to the components.

Instead of reaching out for other state management solutions, like
[Redux](https://redux.js.org/), we decided to use the native context API. Thus,
we defined a [Network context](./src/context/network.js) that it is responsible
for:

* Keeping the global application state.
* Offering a set of functions to interact with the network client (fetching the
  list of interfaces, updating the configuration, etc.).
  
The overall approach is inspired by Kent C. Dodds' excellent article about [How
to use React Context
effectively](https://kentcdodds.com/blog/how-to-use-react-context-effectively).
If you are familiar with Redux, you will find the model quite familiar.

## Interacting with Wicked

At this point, Wicked does not offer a D-Bus interface to query or configure the
network. However, it features a nice XML-based command-line interface (CLI) and
it uses the files under `/etc/sysconfig/network` as configuration sources.

Thus, this module works as follows:

* Reads the network configuration using Wicked's CLI (`show-xml` and
  `show-config` commands).
* Writes the updated configuration to `/etc/sysconfig/network` and asks Wicked
  to load it through the `ifreload` command.
* Listens for events on Wicked's D-Bus interface.

## Testing

At this point, we do not run proper integration tests. That is something we need
to tackle soon. However, we do some testing using [Jest](https://jestjs.io/) and
[React Testing
Library](https://testing-library.com/docs/react-testing-library/intro/). Check
the `*.test.js` files for some examples.

To run the tests, just type `npm test`.
