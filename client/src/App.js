import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Col, Divider, Row, Input } from "antd";
import "react-tabs/style/react-tabs.css";
import { Iframe } from "./Iframe";
import { Form } from "./Form";
import _ from "lodash";
const { TextArea } = Input;

const stopWords = [
  "#jdmporn",
  "#bmw",
  "#japan",
  "#fast",
  "#import",
  "#daily",
  "#dope",
  "#392",
  "#mustang",
  "#camaro",
  "royalcarsmg",
  "#mustangt",
  "#cari",
  "#trending",
  "#trendingreels",
  "#wtf",
  "#blobeye",
  "#old",
  "#e30",
  "#e92",
  "#e46",
  "#e90",
  "#bmwgram",
  "#custom",
  "#merch",
  "#follow",
  "#bmwe30",
  "#e30gram",
  "#e30zone",
  "#retrobmw",
];

const App = () => {
  const [state, setState] = useState([]);
  const [result, setResult] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (window._sharedData) {
      setState(window._sharedData);

      const preloadedTags = window._sharedData.reduce((acc, { message }) => {
        const tgs = message.match(/(^|\s)(#[a-z\d-]+)/gi);
        return tgs
          ? [
              ...new Set([
                ...acc,
                ...tgs
                  .filter((t) => !stopWords.includes(t.trim()))
                  .map((t) => t.trim().toLocaleLowerCase()),
              ]),
            ]
          : acc;
      }, []);

      setTags(preloadedTags);
    }
  }, []);

  console.log("tags", tags);

  const handleAdd = useCallback(
    (newContent) => {
      const tmp = result.filter((item) => item.id !== newContent.id);
      setResult([
        ...tmp,
        { ...newContent, tags: _.sampleSize(tags, _.random(18, 25)) },
      ]);
    },
    [tags, result]
  );

  const handleDelete = useCallback(
    (id) => {
      setResult(result.filter((item) => item.id !== id));
    },
    [result]
  );

  const memorizedContent = useMemo(() => {
    return [...state].sort((a, b) => b.likes - a.likes);
  }, [state]);

  const isAdded = (shortcode) => {
    return result.some((item) => item.id === shortcode);
  };

  return (
    <Row gutter={16}>
      <Col span={16}>
        {memorizedContent.map(({ shortcode, ...data }) => (
          <Row
            gutter={16}
            className={`${isAdded(shortcode) ? "active" : "no-active"}`}
          >
            <Col span={8}>
              <Iframe shortcode={shortcode} />
            </Col>
            <Col span={16}>
              <Form
                preloadedData={data}
                shortcode={shortcode}
                handleAdd={handleAdd}
                handleDelete={handleDelete}
              />
            </Col>
          </Row>
        ))}
      </Col>
      <Col span={8}>
        <TextArea style={{ height: "100%" }} value={JSON.stringify(result)} />
      </Col>
    </Row>
  );
};

export default App;
