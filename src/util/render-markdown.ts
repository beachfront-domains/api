


///  I M P O R T

import marked from "marked";

///  U T I L

const markdownRenderer = new marked.Renderer();

markdownRenderer.image = function(href: string, title: string, text: string): string {
  let output = "";

  output = `<figure><img src="${href}" alt="${text}"`;
  output += this.options.xhtml ? "/>" : ">";
  if (text)
    output += `<figcaption>${text}</figcaption>`;
  output += "</figure>";

  return output;
};

markdownRenderer.paragraph = (text: string): string => {
  // TODO
  // : make this better

  const paragraphBlocklist = [
    "<figure>",
    "<iframe>",
    "<pre>",
    "<video>"
  ];

  paragraphBlocklist.forEach(item => {
    if (text.includes(item))
      return text;
  });

  return `<p>${text}</p>\n`;
};

marked.setOptions({
  breaks: true,
  headerIds: false,
  gfm: true,
  mangle: true,
  pedantic: false,
  renderer: markdownRenderer,
  sanitize: true,
  smartypants: true,
  // tables: true,
  xhtml: true
});



///  E X P O R T

export default (rawContent: string): string => {
  if (!rawContent)
    return "";

  let renderedPost = marked(rawContent);

  /// remove rendered empty <p> tags
  renderedPost = renderedPost.replace("<p></p>", "");

  return renderedPost;
};
