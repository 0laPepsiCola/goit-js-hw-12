import { getImagesByQuery } from "./js/pixabay-api";
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from "./js/render-functions";
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import xOctagonIcon from "./img/bi_x-octagon.svg";

const form = document.querySelector(".form");
const input = form.elements["search-text"];
const loadMoreBtn = document.getElementById("load-more");

const PER_PAGE = 15;
let currentPage = 1;
let currentQuery = "";
let totalHits = 0;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = input.value.trim();

  if (!query) {
    iziToast.warning({
      title: "Warning",
      message: "Please enter a search query",
      position: "topRight",
    });
    return;
  }

  currentQuery = query;
  currentPage = 1;
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage, PER_PAGE);
    totalHits = data.totalHits;

    if (!data || !Array.isArray(data.hits) || data.hits.length === 0) {
      iziToast.error({
        theme: "dark",
        color: "#ef4040",
        message:
          "Sorry, there are no images matching your search query. Please try again!",
        messageColor: "#fafafb",
        iconUrl: xOctagonIcon,
        maxWidth: 432,
        position: "topRight",
      });
      return;
    }

    createGallery(data.hits);

    if (totalHits > PER_PAGE) {
      showLoadMoreButton();
    }
  } catch (error) {
    iziToast.error({
      title: "Error",
      message: "Something went wrong. Try again later.",
      position: "topRight",
    });
  } finally {
    hideLoader();
  }
});

loadMoreBtn.addEventListener("click", async () => {
  currentPage++;
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage, PER_PAGE);

    createGallery(data.hits);

    const { height: cardHeight } = document
      .querySelector(".gallery-item")
      .getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: "smooth",
    });

    const totalPages = Math.ceil(totalHits / PER_PAGE);
    if (currentPage >= totalPages) {
      hideLoadMoreButton();
      iziToast.info({
        theme: "dark",
        color: "#09f",
        message: "We're sorry, but you've reached the end of search results.",
        messageColor: "#fafafb",
        position: "bottomCenter",
        maxWidth: 251,
      });
    } else {
      showLoadMoreButton();
    }
  } catch (error) {
    iziToast.error({
      title: "Error",
      message: "Something went wrong. Try again later.",
      position: "topRight",
    });
  } finally {
    hideLoader();
  }
});
