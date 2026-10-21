import { useEffect, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'contact-book.contacts'
const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Peshawar']
const EMPTY_FORM = { name: '', email: '', phone: '', city: '' }
const INITIAL_CONTACTS = [
  { id: 'contact-1', name: 'Ayesha Khan', email: 'ayesha.khan@example.com', phone: '+1 (202) 555-0101', city: 'Karachi' },
  { id: 'contact-2', name: 'Hamza Ahmed', email: 'hamza.ahmed@example.com', phone: '+1 (202) 555-0102', city: 'Lahore' },
  { id: 'contact-3', name: 'Sara Malik', email: 'sara.malik@example.com', phone: '+1 (202) 555-0103', city: 'Islamabad' },
]
const DEMO_PHONES = {
  'contact-1': '+1 (202) 555-0101',
  'contact-2': '+1 (202) 555-0102',
  'contact-3': '+1 (202) 555-0103',
}

function loadContacts() {
  try {
    const savedContacts = window.localStorage.getItem(STORAGE_KEY)
    if (savedContacts === null) return INITIAL_CONTACTS

    const parsedContacts = JSON.parse(savedContacts)
    if (
      !Array.isArray(parsedContacts) ||
      !parsedContacts.every(
        (contact) =>
          contact &&
          typeof contact.id === 'string' &&
          typeof contact.name === 'string' &&
          typeof contact.email === 'string' &&
          (contact.phone === undefined || typeof contact.phone === 'string') &&
          typeof contact.city === 'string',
      )
    ) {
      throw new Error('Saved contacts have an invalid format.')
    }

    return parsedContacts.map((contact) => ({
      ...contact,
      phone: contact.phone || DEMO_PHONES[contact.id] || '',
    }))
  } catch (error) {
    console.error('Unable to load contacts from localStorage.', error)
    return INITIAL_CONTACTS
  }
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function WindowWidthTracker() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    function updateWindowWidth() {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', updateWindowWidth)
    return () => window.removeEventListener('resize', updateWindowWidth)
  }, [])

  return (
    <div className="width-tracker" aria-live="polite">
      <span className="tracker-dot" aria-hidden="true" />
      Window width <strong>{windowWidth}px</strong>
    </div>
  )
}

function App() {
  const [contacts, setContacts] = useState(loadContacts)
  const [form, setForm] = useState(EMPTY_FORM)
  const [searchTerm, setSearchTerm] = useState('')
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    document.title = `Contacts (${contacts.length})`
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
    } catch (error) {
      console.error('Unable to save contacts to localStorage.', error)
    }
  }, [contacts])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setErrors({})
    setEditingId(null)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}

    if (!form.name.trim()) nextErrors.name = 'Please enter a name.'
    if (!form.email.trim()) {
      nextErrors.email = 'Please enter an email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.'
    }
    const phoneDigits = form.phone.replace(/\D/g, '')
    if (!form.phone.trim()) {
      nextErrors.phone = 'Please enter a phone number.'
    } else if (!/^\+?[\d\s().-]+$/.test(form.phone.trim()) || phoneDigits.length < 7 || phoneDigits.length > 15) {
      nextErrors.phone = 'Enter a valid phone number (7-15 digits).'
    }
    if (!form.city) nextErrors.city = 'Please choose a city.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const contactDetails = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: form.city,
    }

    if (editingId) {
      setContacts((currentContacts) =>
        currentContacts.map((contact) =>
          contact.id === editingId ? { ...contact, ...contactDetails } : contact,
        ),
      )
    } else {
      setContacts((currentContacts) => [
        { id: crypto.randomUUID(), ...contactDetails },
        ...currentContacts,
      ])
    }

    resetForm()
  }

  function handleEdit(contact) {
    setForm({
      name: contact.name,
      email: contact.email,
      phone: contact.phone ?? '',
      city: contact.city,
    })
    setErrors({})
    setEditingId(contact.id)
    document.getElementById('contact-name')?.focus()
  }

  function handleDelete(contactId) {
    setContacts((currentContacts) =>
      currentContacts.filter((contact) => contact.id !== contactId),
    )
    if (editingId === contactId) resetForm()
  }

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.trim().toLowerCase()),
  )

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Contactly home">
          <span className="brand-mark" aria-hidden="true">C</span>
          <span>contactly</span>
        </a>
        <WindowWidthTracker />
      </header>

      <section className="intro">
        <div className="intro-copy-block">
          <p className="eyebrow">YOUR PERSONAL DIRECTORY</p>
          <h1>People, <span>kept close.</span></h1>
          <p className="intro-copy">A happy little home for all your favorite people. <span aria-hidden="true">♡</span></p>
        </div>
        <div className="intro-art" aria-hidden="true">
          <span className="art-heart">♥</span>
          <span className="art-sparkle art-sparkle-one">✦</span>
          <span className="art-sparkle art-sparkle-two">✧</span>
          <svg className="mail-mascot" viewBox="0 0 220 190" role="presentation">
            <ellipse cx="111" cy="165" rx="62" ry="10" fill="#e9d9ed" />
            <circle cx="109" cy="91" r="74" fill="#f4eafa" />
            <path d="M47 82 36 76M173 82l11-6" fill="none" stroke="#d98d9f" strokeWidth="7" strokeLinecap="round" />
            <circle cx="34" cy="75" r="7" fill="#ffc1c8" />
            <circle cx="186" cy="75" r="7" fill="#ffc1c8" />
            <rect x="53" y="61" width="114" height="87" rx="20" fill="#f3a9b5" />
            <path d="m56 76 54 42 54-42" fill="#ffd8dc" stroke="#fff0f0" strokeWidth="5" strokeLinejoin="round" />
            <path d="M58 133 91 105M162 133l-33-28" fill="none" stroke="#e98f9e" strokeWidth="5" strokeLinecap="round" />
            <circle cx="91" cy="91" r="4" fill="#533e58" />
            <circle cx="128" cy="91" r="4" fill="#533e58" />
            <path d="M101 101q9 9 18 0" fill="none" stroke="#9e5b6d" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="78" cy="102" rx="8" ry="4" fill="#ffced1" />
            <ellipse cx="141" cy="102" rx="8" ry="4" fill="#ffced1" />
            <path d="m89 148-5 10M132 148l5 10" fill="none" stroke="#9d6b9f" strokeWidth="6" strokeLinecap="round" />
            <path d="m76 157 10 2M132 159l10-2" fill="none" stroke="#9d6b9f" strokeWidth="5" strokeLinecap="round" />
            <path d="m145 44 3-8 3 8 8 3-8 3-3 8-3-8-8-3z" fill="#f2c85b" />
          </svg>
          <span className="art-note">a little hello!</span>
        </div>
      </section>

      <div className="workspace">
        <section className="contact-panel" aria-labelledby="contacts-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR CIRCLE</p>
              <h2 id="contacts-heading">Contacts <span className="count-badge">{contacts.length}</span></h2>
            </div>
          </div>

          <label className="search-field">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <span className="visually-hidden">Search contacts by name</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name..."
            />
            <kbd>/</kbd>
          </label>

          <div className="contact-list">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <article className="contact-card" key={contact.id}>
                  <div className="avatar" aria-hidden="true">{getInitials(contact.name)}</div>
                  <div className="contact-info">
                    <h3>{contact.name}</h3>
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    {contact.phone ? (
                      <div className="phone-row">
                        <a className="phone-label" href={`tel:${contact.phone}`}>
                          <span aria-hidden="true">☎</span> {contact.phone}
                        </a>
                        {DEMO_PHONES[contact.id] === contact.phone && (
                          <span className="demo-badge">demo</span>
                        )}
                      </div>
                    ) : (
                      <span className="phone-label phone-missing">Phone number not added</span>
                    )}
                    <span className="city-label">
                      <span aria-hidden="true">⌖</span> {contact.city}
                    </span>
                  </div>
                  <div className="card-actions">
                    <button
                      className="icon-button edit-button"
                      type="button"
                      aria-label={`Edit ${contact.name}`}
                      onClick={() => handleEdit(contact)}
                    >
                      Edit
                    </button>
                    <button
                      className="icon-button delete-button"
                      type="button"
                      aria-label={`Delete ${contact.name}`}
                      onClick={() => handleDelete(contact.id)}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon" aria-hidden="true">◎</span>
                <h3>No contacts found.</h3>
                <p>Try another name or add someone new.</p>
              </div>
            )}
          </div>
          <p className="list-footnote">
            Showing {filteredContacts.length} of {contacts.length} {contacts.length === 1 ? 'person' : 'people'}
          </p>
        </section>

        <aside className="form-panel" aria-labelledby="form-heading">
          <div className="form-panel-heading">
            <span className="form-icon" aria-hidden="true">{editingId ? '✎' : '+'}</span>
            <div>
              <p className="eyebrow">{editingId ? 'MAKE A CHANGE' : 'GROW YOUR CIRCLE'}</p>
              <h2 id="form-heading">{editingId ? 'Edit contact' : 'Add a contact'}</h2>
            </div>
          </div>
          <p className="form-description">
            {editingId ? 'Update the details below.' : 'Save someone new to your directory.'}
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="contact-name">Name <span>*</span></label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Ayesha Khan"
                value={form.name}
                onChange={handleChange}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && <p className="field-error" id="name-error">{errors.name}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="contact-email">Email <span>*</span></label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && <p className="field-error" id="email-error">{errors.email}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="contact-phone">Phone number <span>*</span></label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="e.g. +92 300 1234567"
                value={form.phone}
                onChange={handleChange}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
              {errors.phone && <p className="field-error" id="phone-error">{errors.phone}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="contact-city">City <span>*</span></label>
              <select
                id="contact-city"
                name="city"
                value={form.city}
                onChange={handleChange}
                aria-invalid={Boolean(errors.city)}
                aria-describedby={errors.city ? 'city-error' : undefined}
              >
                <option value="">Select a city</option>
                {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
              {errors.city && <p className="field-error" id="city-error">{errors.city}</p>}
            </div>

            <button className="submit-button" type="submit">
              {editingId ? 'Update Contact' : 'Add Contact'}
              <span aria-hidden="true">→</span>
            </button>
            {editingId && (
              <button className="cancel-button" type="button" onClick={resetForm}>
                Cancel editing
              </button>
            )}
          </form>
          <div className="privacy-note">
            <span aria-hidden="true">▣</span>
            Your contacts are saved privately on this device.
          </div>
        </aside>
      </div>

      <footer className="page-footer">
        <span>Made for keeping in touch.</span>
        <span>CONTACTLY <span className="footer-dot">•</span> PERSONAL DIRECTORY</span>
      </footer>
    </main>
  )
}

export default App
