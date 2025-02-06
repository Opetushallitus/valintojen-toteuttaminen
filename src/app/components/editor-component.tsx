import React, { forwardRef, useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

type QuillProps = {
  defaultValue: string;
  setContentChanged: (value: string) => void;
};

// Editor is an uncontrolled React component
const Editor = forwardRef<Quill, QuillProps>(
  ({ defaultValue, setContentChanged }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const defaultValueRef = useRef(defaultValue);
    const contentChangedRef = useRef(setContentChanged);

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

        if (defaultValueRef.current) {
          const delta = quill.clipboard.convert({
            html: defaultValueRef.current,
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

export type EditorProps = {
  editorContent: string;
  setContentChanged: (value: string) => void;
};

export const EditorComponent = ({
  editorContent,
  setContentChanged,
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
      defaultValue={editorContent}
      setContentChanged={setContentChanged}
    />
  );
};
