<template>
  <div class="how-it-works">
    <h2>Overview</h2>
    <div>
      As title says, that's SharePoint REST API Metadata Explorer. What is metadata?
    </div>
    <div>
      Metadata is a special type of file, which describes all endpoints for a particular web service. It describes not only endpoints, but methods, types, parameters, associations, annotations, properties. There is a metadata file for SharePoint REST API as well. It's relatively easy to get it. Just issue
      <code>HTTP GET</code> request to
      <code>https://your-sharepoint-site/_api/$metadata</code>. SharePoint REST API metadata file is useful if you want to explore all different methods and types available for REST API. However the file is pretty big (about 1.5MB). It's difficult to search inside, that's why this project was created. It helps you to explore SharePoint REST API in an easy way.
    </div>

    <h2>Important</h2>
    <code>$metadata</code> is just a description of a web service. In case of SharePoint it doesn't give you examples on how to construct REST queries. It doesn't provide you an information about HTTP method you should use. However you can discover REST API urls structure, methods, types and parameters. For examples or detailed information please refer to the official docs here -
    <a href="https://docs.microsoft.com/en-us/sharepoint/dev/sp-add-ins/get-to-know-the-sharepoint-rest-service#sharepoint-rest-service-topics" target="_blank">SharePoint REST service topics</a>.
    <code>SharePoint REST API Metadata Explorer</code> has a built-in mechanism to show you links to the official docs, where it is possible.
    <div>
      <code>SharePoint REST API Metadata Explorer</code> uses <code>$metadata</code> from SharePoint Online tenant with Targeted release (formerly known as First release). That's why you always see the latest available snapshot of SharePoint REST API. Some API might be in preview and not available in your tenant. </div>
    <h2>Architecture</h2>
    <div>
      <div>Below picture demonstrates how
        <code>SharePoint REST API Metadata Explorer</code> works:</div>
      <br>
      <img class="architecture" src="../../assets/architecture.png" />
      <div>
        <ol>
          <li>There is an azure function, which gets triggered by a timer (once a day).</li>
          <li>The function gets SharePoint metadata and extracts all valuable information into JSON object.</li>
          <li>The function stores JSON in Azure blob.</li>
          <li>SharePoint REST API Metadata Explorer uses JSON, saved by Azure function to show you the metadata info.</li>
        </ol>
      </div>
      <div> </div>
    </div>

    <h2>Feedback</h2>
    <div>
      For any feedback, please use GitHub
      <a href="">issues</a>, or write to me directly via social networks or email.
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({})
</script>
<style lang="scss" scoped>
.how-it-works {
  margin: 20px 0 20px 20px;
  overflow: auto;
  font-size: 18px;
  font-family: $textFontFamily;
  color: #2f2f2f;
  line-height: 24px;

  div {
    margin: 6px 0;
  }

  .architecture {
    border: 1px solid #f1eded;
    width: 730px;
  }
}
</style>
