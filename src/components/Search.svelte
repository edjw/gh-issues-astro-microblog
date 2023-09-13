<script lang="ts">
  import Fuse from "fuse.js";

  export let allPostsSearchIndex;

  let searchOptions = {
    keys: ["title", "body", "tags", "slug"],
    includeMatches: true,
    minMatchCharLength: 2,
    threshold: 0.5,
  };

  const fuse = new Fuse(allPostsSearchIndex, searchOptions);

  let query = "";
  $: searchResults = [];

  const handleSearch = () => {
    searchResults = fuse
      .search(query)
      .map((result) => result.item)
      .slice(0, 5);
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
            <a href="/post/{post.slug}/" data-astro-reload>
              {post.title}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>
