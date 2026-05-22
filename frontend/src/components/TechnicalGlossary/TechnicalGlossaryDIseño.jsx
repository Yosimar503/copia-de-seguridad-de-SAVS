import React from 'react';
import { BookOpen } from 'lucide-react';
import { useTechnicalGlossaryLogica } from './TechnicalGlossaryLogica';
import './TechnicalGlossary.css';

function TechnicalGlossaryDIseño() {
  const { terms } = useTechnicalGlossaryLogica();

  return (
    <aside className="card glossary-card">
      <div className="glossary-header">
        <BookOpen size={24} className="glossary-icon" />
        <h3 className="glossary-title">Glosario Técnico</h3>
      </div>
      <div className="glossary-content">
        {terms.map((item, index) => (
          <div key={index} className="glossary-item">
            <h4 className="glossary-term">{item.term}</h4>
            <p className="glossary-definition">{item.definition}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default TechnicalGlossaryDIseño;
