import React, {useState} from 'react';

function RApp() {

  return (
      <div>
        <h1>Shame on you!</h1>
        You have included <a href="https://covid19map.io">covid19map.io</a> in your website, but disregarded the license terms.<br />
        Open-source is a beautiful thing, because it helps to spread ideas and source code for free. The one little thing you can do<br />
        is <i>pay respect</i> to the work hours the orginal authors put into the software that you were granted to take for free.<br />
        This is also a condition of the <a href="https://github.com/daniel-karl/covid19-map/blob/master/LICENSE.txt">license that has
        been given to you</a>.<br /><br />
        To get removed from the blacklist please
        <ul>
          <li>follow our license terms by adding a link to <a href="https://covid19map.io">covid19map.io</a> in your website</li>
          <li>and then <a href="https://github.com/daniel-karl/covid19-map/issues">open a ticket</a> to let us know.</li>
        </ul>
      </div>
  );
}

export default RApp;
