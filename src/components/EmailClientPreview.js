import React, { useState } from 'react';
import { generateHTMLSignature } from '../utils/signatureGenerator';
import './EmailClientPreview.css';

function EmailClientPreview({ signatureData }) {
  const [selectedClient, setSelectedClient] = useState('gmail-desktop');
  
  const clients = {
    'gmail-desktop': { name: 'Gmail (Desktop)', icon: '📧' },
    'gmail-mobile': { name: 'Gmail (Mobile)', icon: '📱' },
    'outlook': { name: 'Outlook', icon: '📨' },
    'apple-mail': { name: 'Apple Mail', icon: '✉️' },
    'hey': { name: 'Hey.com', icon: '💌' },
    'superhuman': { name: 'Superhuman', icon: '⚡' }
  };

  const htmlSignature = generateHTMLSignature(signatureData);

  return (
    <div className="email-client-preview">
      <h2>📱 Email Client Preview</h2>
      <p className="section-hint">
        See exactly how your signature will look in different email clients
      </p>

      <div className="client-selector">
        {Object.entries(clients).map(([key, client]) => (
          <button
            key={key}
            className={`client-btn ${selectedClient === key ? 'active' : ''}`}
            onClick={() => setSelectedClient(key)}
          >
            <span className="client-icon">{client.icon}</span>
            <span className="client-name">{client.name}</span>
          </button>
        ))}
      </div>

      <div className="preview-frame">
        <div className={`preview-wrapper ${selectedClient}`}>
          <div className="email-header">
            <div className="email-subject">Re: Project Discussion</div>
            <div className="email-from">From: client@example.com</div>
          </div>
          <div className="email-body">
            <p>Hi there,</p>
            <p>I'd like to discuss a potential project...</p>
            <div className="email-signature" dangerouslySetInnerHTML={{ __html: htmlSignature }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailClientPreview;



