(() => {
  'use strict';

  const KEY = 'nexa-demo-v1';

  const initial = () => ({
    name: 'Explorer',
    agents: {
      research: true,
      coordination: false,
      verification: false
    },
    chat: [],
    events: []
  });

  let state;

  try {
    state = {
      ...initial(),
      ...JSON.parse(localStorage.getItem(KEY) || '{}')
    };
  } catch {
    state = initial();
  }

  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  };

  const log = (label) => {
    state.events.unshift({
      label,
      date: new Date().toISOString()
    });

    state.events = state.events.slice(0, 80);
    save();
  };

  const escape = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  const page = document.body.dataset.page;

  // OVERVIEW
  if (page === 'index.html') {
    const hero = document.querySelector('.hero-copy h1');

    if (state.name !== 'Explorer' && hero) {
      document.querySelector('.pill').title =
        `Welcome, ${state.name}`;
    }
  }

  // NEXA CHAT
  if (page === 'chat.html') {
    const messages = document.querySelector('#messages');
    const input = document.querySelector('#chat-input');

    const comingSoonMessage =
      "NEXA AI is not active yet.\n\n" +
      "We're currently working on bringing AI-powered chat to NEXA. " +
      "A new update is coming soon!\n\n" +
      "For the latest news and development updates, " +
      "follow our official X (Twitter) account:\n" +
      "@NexaDotTech\n" +
      "https://x.com/NexaDotTech\n\n" +
      "Thank you for your patience and support!";

    const reply = () => comingSoonMessage;

    const formatMessage = (text) => {
      return escape(text)
        .replace(
          /https:\/\/x\.com\/NexaDotTech/g,
          '<a href="https://x.com/NexaDotTech" ' +
          'target="_blank" rel="noopener noreferrer">' +
          'https://x.com/NexaDotTech</a>'
        )
        .replace(/\n/g, '<br>');
    };

    const render = () => {
      const welcome = `
        <div class="message bot">
          <div class="message-label">NEXA / ASSISTANT</div>
          Welcome to NEXA Chat! 👋
          <br><br>
          Our AI chat is currently under development.
          Send a message to learn more about upcoming updates.
        </div>
      `;

      messages.innerHTML =
        (state.chat.length ? '' : welcome) +
        state.chat.map((m) => `
          <div class="message ${m.role}">
            <div class="message-label">
              ${m.role === 'bot' ? 'NEXA / ASSISTANT' : 'YOU'}
            </div>
            ${formatMessage(m.text)}
          </div>
        `).join('');

      messages.scrollTop = messages.scrollHeight;
    };

    const send = (q) => {
      q = q.trim();

      if (!q) return;

      state.chat.push({
        role: 'user',
        text: q
      });

      state.chat.push({
        role: 'bot',
        text: reply()
      });

      state.chat = state.chat.slice(-60);

      log('Asked NEXA: ' + q.slice(0, 70));

      render();
      input.value = '';
    };

    document.querySelector('#chat-form')
      .addEventListener('submit', (e) => {
        e.preventDefault();
        send(input.value);
      });

    document.querySelector('#clear-chat')
      .addEventListener('click', () => {
        if (!confirm(
          'Clear all NEXA chat messages stored on this device?'
        )) return;

        state.chat = [];
        save();
        render();
        input.focus();
      });

    document.querySelectorAll('[data-prompt]')
      .forEach((button) => {
        button.addEventListener('click', () => {
          send(button.dataset.prompt);
        });
      });

    render();
  }

  // AGENT STUDIO
  if (page === 'agents.html') {
    const agents = [
      {
        id: 'research',
        name: 'Research Agent',
        icon: '✳',
        text: 'Explore information, summarize context, and help form a clearer picture before a decision.'
      },
      {
        id: 'coordination',
        name: 'Coordination Agent',
        icon: '⬡',
        text: 'Explore how multiple agent roles might hand off tasks and organize connected workflows.'
      },
      {
        id: 'verification',
        name: 'Verification Agent',
        icon: '◇',
        text: 'Imagine checks and human approval before any proposed onchain action.'
      }
    ];

    const render = () => {
      document.querySelector('#agent-list').innerHTML =
        agents.map((a) => `
          <article class="agent-card">
            <div class="agent-mark">${a.icon}</div>
            <h2>${a.name}</h2>
            <p>${a.text}</p>
            <div class="agent-bottom">
              <span>
                ${state.agents[a.id]
                  ? 'ENABLED / DEMO'
                  : 'DISABLED / DEMO'}
              </span>
              <button
                class="toggle"
                aria-label="Toggle ${a.name}"
                aria-pressed="${!!state.agents[a.id]}"
                data-agent="${a.id}">
              </button>
            </div>
          </article>
        `).join('');

      document.querySelectorAll('[data-agent]')
        .forEach((button) => {
          button.addEventListener('click', () => {
            const id = button.dataset.agent;

            state.agents[id] = !state.agents[id];

            log(
              `${agents.find((a) => a.id === id).name} ` +
              `${state.agents[id] ? 'enabled' : 'disabled'}`
            );

            render();
          });
        });
    };

    render();
  }

  // ACTIVITY
  if (page === 'activity.html') {
    const list = document.querySelector('#activity-list');

    const render = () => {
      list.innerHTML = state.events.length
        ? state.events.map((e) => `
            <div class="activity-row">
              <div class="activity-icon">◷</div>
              <div>
                <strong>${escape(e.label)}</strong>
                <small>
                  ${new Date(e.date).toLocaleString()}
                </small>
              </div>
            </div>
          `).join('')
        : `<div class="empty-state">
             No activity yet.<br>
             Try AI Chat or switch an agent on in Agent Studio.
           </div>`;
    };

    document.querySelector('#clear-activity')
      .addEventListener('click', () => {
        state.events = [];
        save();
        render();
      });

    render();
  }

  // SETTINGS
  if (page === 'settings.html') {
    const input = document.querySelector('#profile-name');

    input.value = state.name;

    document.querySelector('#profile-form')
      .addEventListener('submit', (e) => {
        e.preventDefault();

        state.name =
          input.value.trim().slice(0, 30) || 'Explorer';

        log('Updated display name');

        document.querySelector('#profile-feedback')
          .textContent = 'Saved locally.';
      });

    document.querySelector('#reset-data')
      .addEventListener('click', () => {
        if (!confirm(
          'Reset all local NEXA demo data?'
        )) return;

        state = initial();
        save();

        input.value = state.name;

        document.querySelector('#reset-feedback')
          .textContent = 'Demo data reset.';
      });
  }
})();
