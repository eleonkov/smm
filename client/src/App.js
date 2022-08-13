import React from "react";
import { Col, Row, Input } from "antd";

import { Iframe } from "./components/Iframe";
import { Form } from "./components/Form";
import { useSharedContent } from "./hooks/useSharedContent";

import "react-tabs/style/react-tabs.css";
import { useSharedData } from "./hooks/useSharedData";

const { TextArea } = Input;

const App = () => {
  const sharedData = useSharedData();
  const { sharedContent, addContent, removeContent, isContentExists } =
    useSharedContent();

  return (
    <Row gutter={16}>
      <Col span={16}>
        {sharedData.length}
        {sharedData.map(({ shortcode, ...data }) => (
          <Row
            gutter={16}
            className={`${isContentExists(shortcode) ? "active" : "no-active"}`}
          >
            <Col span={8}>
              <Iframe shortcode={shortcode} />
            </Col>
            <Col span={16}>
              <Form
                preloadedData={data}
                shortcode={shortcode}
                handleAdd={addContent}
                handleDelete={removeContent}
              />
            </Col>
          </Row>
        ))}
      </Col>
      <Col span={8}>
        <TextArea
          style={{ height: "100%" }}
          value={JSON.stringify(sharedContent)}
        />
      </Col>
    </Row>
  );
};

export default App;
