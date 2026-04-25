import React from "react";

const About = () => {
  return (
    <div className="container">
      <div  style={{ height: "65vh" }}>
      <div class="card text-center my-3">
        <div class="card-header">
          <ul class="nav nav-tabs card-header-tabs">
            <li class="nav-item">
              <a class="nav-link active" aria-current="true" href="#/">
                Active tab
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#/">
                Tab
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link disabled"
                href="#/"
                tabindex="-1"
                aria-disabled="true"
              >
                Disabled tab
              </a>
            </li>
          </ul>
        </div>
        <div class="card-body">
          <h3 class="card-title">We Are One</h3>
          <p class="card-text">
            Read in the name of your Lord, who created you{" "}
          </p>
        </div>
      </div>

      </div>
    </div>
  );
};

export default About;
