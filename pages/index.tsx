import React from "react";
import Link from "next/link";

const Index = () => {
  return (
    <div>
      <Link href="/[slug]" as="/test" passHref>
        <a>Go To Test</a>
      </Link>
    </div>
  );
};

export default Index;
