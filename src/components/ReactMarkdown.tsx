import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import probeImageSize from "probe-image-size";

const videoFileTypes = [".mov", ".mp4"];
const isURLVideo = (url: string): boolean => {
  const fileType = url.substring(url.lastIndexOf(".")).toLowerCase();
  return videoFileTypes.includes(fileType);
};

export default function Markdown({
  markdown,
}: {
  markdown: string;
}) {

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        img: async (props) => {
          console.log(props)
          //   let alt = "";
          //   if (typeof props.src === "undefined") {
          //     return false;
          //   }
          //   if (props.alt === undefined) {
          //     alt = "";
          //   }

          //   const { width, height } = await probeImageSize(props.src);
          //   return (
          //     <img
          //       src={props.src}
          //       alt={alt}
          //       width={width}
          //       height={height}
          //       decoding="async"
          //       loading="lazy"
          //     />
          //   );
          return (
            <p>hello</p>
          );
        },
        p: (props) => {
          const { children } = props;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const node: any = props.node;

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const href: string = node.children[0]?.properties?.href;

          if (href === undefined) {
            return <p>{children}</p>;
          }

          if (isURLVideo(href)) {
            return (
              <div className="flex justify-center">
                <video
                  controls
                  muted
                  preload="metadata"
                  className="my-0 max-h-72 border dark:border-gray-500"
                >
                  <source src={href} type="video/mp4" />
                </video>
              </div>
            );
          }

          return <p>{children}</p>;
        },
      }}
      // eslint-disable-next-line react/no-children-prop
      children={markdown}
    />
  );
}
