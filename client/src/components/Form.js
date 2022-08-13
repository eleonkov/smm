import { Button, Input } from "antd";
import { useState } from "react";

export const Form = ({ preloadedData, shortcode, handleAdd, handleDelete }) => {
  const [data, setData] = useState({
    id: shortcode,
    resources: preloadedData.resources,
    message: "",
    source: {
      owner: "",
      via: "",
      photo: "",
    },
  });

  const handleUpdateSource = (e) => {
    setData((draft) => ({
      ...draft,
      source: {
        ...draft.source,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const handleUpdateMessage = (e) => {
    setData({ ...data, message: e.target.value });
  };

  return (
    <div>
      Likes: {preloadedData?.likes} | Comments: {preloadedData?.comments}
      <Input.TextArea
        rows={10}
        value={preloadedData.message.replaceAll("\\n", "\n")}
      ></Input.TextArea>
      <Input
        onChange={handleUpdateMessage}
        name="message"
        placeholder="Message"
      />
      <Input onChange={handleUpdateSource} name="owner" placeholder="OWNER" />
      <Input onChange={handleUpdateSource} name="photo" placeholder="PHOTO" />
      <Input onChange={handleUpdateSource} name="via" placeholder="VIA" />
      <Button type="default" onClick={() => handleDelete(data.id)}>
        Delete
      </Button>
      <Button type="primary" onClick={() => handleAdd(data)}>
        Add
      </Button>
    </div>
  );
};
