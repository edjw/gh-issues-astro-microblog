<script lang="ts">
  import Fuse from "fuse.js";

  export let allPostsSearchIndex;

  const options = {
    keys: ["title", "body", "tags", "slug"],
    threshold: 0.25,
    minMatchCharLength: 2,
    distance: 5000,
  };

  const fuse = new Fuse(allPostsSearchIndex, options);

  let query = "";

  type searchIndexPost = {
    title: string;
    slug: string;
    body: string;
    created_at: string;
    updated_at: string;
    tags: string;
  };

  let searchResults: searchIndexPost[] = [];

  $: searchResults;

  function isSearchIndexPost(object: any): object is searchIndexPost {
    return (
      "title" in object &&
      "slug" in object &&
      "body" in object &&
      "created_at" in object &&
      "updated_at" in object &&
      "tags" in object
    );
  }

  const handleSearch = () => {
    searchResults.length = 0;
    fuse.search(query).forEach((result) => {
      if (isSearchIndexPost(result.item)) {
        if (searchResults.length < 5) {
          searchResults.push(result.item);
        }
      } else {
        console.error("Invalid item format:", result.item);
      }
    });
  };
</script>

<!-- backdrop -->
<div
  class="hidden fixed h-[100dvh] w-[100dvw] inset-0 bg-white dark:bg-gray-800 dark:text-white bg-opacity-100 z-50"
  id="search-dialog"
>
  <!-- dialog wrapper -->
  <div class="relative md:w-[28rem] md:mx-auto md:mb-auto md:mt-14">
    <!-- dialog contents -->
    <div class="flex flex-col px-4 py-8 gap-y-8">
      <!-- search bar -->
      <div class="flex gap-x-4 justify-between items-center relative px-4Ì">
        <input
          class="h-10 w-full border rounded px-2 dark:text-black focus-within:outline-none"
          type="search"
          name="search"
          placeholder="Search"
          bind:value={query}
          on:input={handleSearch}
          id="search-input"
        />

        <button type="reset" aria-label="Cancel" class="" id="search-cancel"
          >Cancel</button
        >
      </div>
      <!-- search results -->

      <ul class="flex flex-col gap-y-8">
        {#each searchResults as post}
          <li>
            <a
              href="/post/{post.slug}/"
              class="block w-full sm:w-fit py-2"
              data-astro-reload
            >
              {post.title}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>
