export const Iframe = ({ shortcode }) => (
  <iframe
    src={`https://www.instagram.com/p/${shortcode}/embed/captioned`}
    id={shortcode}
    key={shortcode}
    width="100%"
    height={400}
    frameborder="0"
    scrolling="no"
    allowtransparency="true"
  ></iframe>
);
