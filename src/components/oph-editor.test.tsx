import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { OphEditor } from './oph-editor';
import { describe, expect, test, vi } from 'vitest';

const getEditorContent = (el: HTMLElement) =>
  el.querySelector('[contenteditable="true"]');

describe('OphEditor', () => {
  test('displays initial content', () => {
    const handleContentChanged = vi.fn();

    render(
      <OphEditor
        editorContent="<h1>Hello-heading</h1><p>Hello, World!</p>"
        onContentChanged={handleContentChanged}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Hello-heading' }),
    ).toBeVisible();
    expect(screen.getByText('Hello, World!')).toBeVisible();
  });

  test('calls onContentChanged on init', () => {
    const handleContentChanged = vi.fn();
    render(
      <OphEditor
        editorContent="<p>Initial</p>"
        onContentChanged={handleContentChanged}
      />,
    );
    expect(handleContentChanged).toHaveBeenCalledWith('<p>Initial</p>');
  });

  test('calls onContentChanged when content typed', async () => {
    const handleContentChanged = vi.fn();
    const { container } = render(
      <OphEditor editorContent="" onContentChanged={handleContentChanged} />,
    );
    const editor = getEditorContent(container);
    await userEvent.click(editor!);
    await userEvent.type(editor!, 'New Content');
    expect(handleContentChanged).toHaveBeenCalledWith('<p>New Content</p>');
  });

  test('updates content when editorContent prop changes', () => {
    const { rerender, container } = render(
      <OphEditor editorContent="<p>Initial</p>" onContentChanged={() => {}} />,
    );
    let editor = getEditorContent(container);
    expect(editor!.innerHTML).toBe('<p>Initial</p>');

    rerender(
      <OphEditor editorContent="<p>Updated</p>" onContentChanged={() => {}} />,
    );
    editor = getEditorContent(container);
    expect(editor!.innerHTML).toBe('<p>Updated</p>');
  });

  test('empties editor content when editorContent is empty string', () => {
    const handleContentChanged = vi.fn();

    const { rerender, container } = render(
      <OphEditor
        editorContent="<p>Initial</p>"
        onContentChanged={handleContentChanged}
      />,
    );
    const editor = getEditorContent(container);
    expect(editor!.innerHTML).toBe('<p>Initial</p>');

    rerender(
      <OphEditor editorContent="" onContentChanged={handleContentChanged} />,
    );
    expect(handleContentChanged).toHaveBeenCalledWith('');
  });

  test('clears editor content when deleting everything from editor', async () => {
    const handleContentChanged = vi.fn();

    const { container } = render(
      <OphEditor
        editorContent="<p>Initial</p>"
        onContentChanged={handleContentChanged}
      />,
    );
    const editor = getEditorContent(container);
    expect(editor!.innerHTML).toBe('<p>Initial</p>');

    await userEvent.click(editor!);
    await userEvent.clear(editor!);

    expect(handleContentChanged).toHaveBeenCalledWith('');
  });

  test('strip unallowed tags from editorContent', () => {
    const { container } = render(
      <OphEditor
        editorContent="<p>Initial</p><img><script src=''></script>"
        onContentChanged={() => {}}
      />,
    );
    const editor = getEditorContent(container);
    expect(editor!.innerHTML).toBe('<p>Initial</p>');
  });
});
