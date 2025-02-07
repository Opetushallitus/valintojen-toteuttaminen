import React, { forwardRef, useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

/**
 * Properties for the Editor component.
 *
 * @property {string} editorContent - The content to be displayed in the editor.
 * @property {function} onContentChanged - Callback function that is called when the content changes in the editor.
 *
 */
export type EditorProps = {
  editorContent: string;
  onContentChanged: (value: string) => void;
};

// Editor is an uncontrolled React component
const Editor = forwardRef<Quill, EditorProps>(
  ({ editorContent, onContentChanged }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef(editorContent);
    const contentChangedRef = useRef(onContentChanged);

    useEffect(() => {
      if (containerRef.current && ref) {
        const container = containerRef.current;

        const editorContainer = container.appendChild(
          container.ownerDocument.createElement('div'),
        );
        const quill = new Quill(editorContainer, {
          theme: 'snow',
        });

        if (typeof ref === 'function') {
          ref(quill);
        } else {
          ref.current = quill;
        }

        if (contentRef.current) {
          const delta = quill.clipboard.convert({
            html: contentRef.current,
          });
          quill.setContents(delta);
        }

        quill.on(Quill.events.TEXT_CHANGE, () => {
          contentChangedRef?.current?.(quill.getSemanticHTML());
        });
        return () => {
          if (typeof ref === 'function') {
            ref(null);
          } else {
            ref.current = null;
          }
          container.innerHTML = '';
        };
      }
    }, [ref]);

    return <div id="oph-editor" ref={containerRef}></div>;
  },
);

Editor.displayName = 'Editor';

export const EditorComponent = ({
  editorContent,
  onContentChanged,
}: EditorProps) => {
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    const quill = quillRef.current;
    if (quill instanceof Quill) {
      const delta = quill.clipboard.convert({ html: editorContent });
      quill.setContents(delta);
    }
  }, [editorContent]);

  return (
    <Editor
      ref={quillRef}
      editorContent={editorContent}
      onContentChanged={onContentChanged}
    />
  );
};
