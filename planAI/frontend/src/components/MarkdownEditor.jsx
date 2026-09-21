import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownEditor = ({ value, onChange, placeholder = 'Write Markdown here...' }) => {
  return (
    <div className="markdown-editor">
      <div className="markdown-pane">
        <label>Markdown</label>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={14}
        />
      </div>

      <div className="markdown-pane">
        <label>Preview</label>
        <div className="markdown-preview">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  target={props.href?.startsWith('http') ? '_blank' : undefined}
                  rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                />
              ),
            }}
          >
            {value || 'Preview will appear here.'}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;
