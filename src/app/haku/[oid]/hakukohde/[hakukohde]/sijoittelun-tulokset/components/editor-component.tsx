import React, { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

// Editor is an uncontrolled React component
const Editor = forwardRef(
  ({ defaultValue, onTextChange, onSelectionChange }, ref) => {
    const containerRef = useRef(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
      const container = containerRef.current;
      const editorContainer = container.appendChild(
        container.ownerDocument.createElement('div'),
      );
      const quill = new Quill(editorContainer, {
        theme: 'snow',
      });

      ref.current = quill;

      if (defaultValueRef.current) {
        const delta = quill.clipboard.convert(defaultValueRef.current);
        quill.setContents(delta);
      }

      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        onTextChangeRef.current?.(...args);
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      return () => {
        ref.current = null;
        container.innerHTML = '';
      };
    }, [ref]);

    return <div id="oph-editor" ref={containerRef}></div>;
  },
);

Editor.displayName = 'Editor';

export type EditorProps = {
  editorContent: string;
  setContentChanged: (value: string) => void;
};

export const EditorComponent = (
  {editorContent, setContentChanged}: EditorProps
) => {

  const quillRef = useRef({defaultValue: editorContent});

  useEffect(() => {
    const quill = quillRef.current;
    if (quill instanceof Quill) {
      const delta = quill.clipboard.convert({html: editorContent});
      quill.setContents(delta);
    }
  }, [editorContent])

  return (
    <Editor ref={quillRef}/>);
};

