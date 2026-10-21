# Contactly

A responsive personal contact book built with React and Vite. Add, edit, delete,
and search contacts by name. Each contact includes a name, email, phone number,
and city. Contact data is stored in your browser's local storage, so it stays
available after refreshing the page.

## Getting started

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

Run the production build and lint checks:

```sh
npm run build
npm run lint
```

The contact list starts with sample contacts when there is no saved contact data.
Existing saved contacts without phone numbers are kept and can be updated with
their phone number when edited.
