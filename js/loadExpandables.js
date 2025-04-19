document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.hero.grid-background');
  
    const data = typeof faqData !== 'undefined' ? faqData : typeof termsData !== 'undefined' ? termsData : [];
  
    data.forEach(item => {
      const section = document.createElement('section');
      section.className = 'expandable-section';
  
      const header = document.createElement('div');
      header.className = 'expandable-header';
  
      const title = document.createElement('h3');
      title.className = 'expandable-title';
      title.textContent = item.question || item.term;
  
      const toggle = document.createElement('span');
      toggle.className = 'expandable-toggle';
      toggle.textContent = '+';
  
      header.appendChild(title);
      header.appendChild(toggle);
  
      const content = document.createElement('div');
      content.className = 'expandable-content';
      content.style.display = 'none';
  
      const containerDiv = document.createElement('div');
      containerDiv.className = 'definition-container';
  
      if (item.definition) {
        const label = document.createElement('span');
        label.className = 'definition-label';
        label.textContent = 'Definition:';
        containerDiv.appendChild(label);
      }
  
      const text = document.createElement('span');
      text.className = 'definition-text';
      text.textContent = item.answer || item.definition;
      containerDiv.appendChild(text);
  
      content.appendChild(containerDiv);
      section.appendChild(header);
      section.appendChild(content);
      container.appendChild(section);
    });
  });
  