import React from "react";
import styles from "./loader.module.css";

const OldLoader = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.loader} />
    </div>
  );
};

export default OldLoader;
