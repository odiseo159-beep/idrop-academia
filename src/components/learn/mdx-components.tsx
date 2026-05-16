import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

export const mdxComponents: MDXComponents = {
  h2: (props: ComponentProps<"h2">) => <h2 {...props} />,
  h3: (props: ComponentProps<"h3">) => <h3 {...props} />,
  p: (props: ComponentProps<"p">) => <p {...props} />,
  a: (props: ComponentProps<"a">) => (
    <a target="_blank" rel="noopener noreferrer" {...props} />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => <blockquote {...props} />,
  table: (props: ComponentProps<"table">) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
};
