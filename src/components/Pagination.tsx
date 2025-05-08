import "bootstrap/dist/css/bootstrap.min.css";
import "../dist/css/Pagination.css";

type PaginationPropsType = {
  currentPageNumber: number;
  totalNumberOfPages: number;
  paginate: (selectionType: string, pageNumber: string | number) => void;
};

function Pagination(props: PaginationPropsType) {
  const pageNumbers = [];

  for (let i = 1; i <= 20; i++) pageNumbers.push(i);

  if (props.currentPageNumber > props.totalNumberOfPages)
    props.paginate("Change", props.totalNumberOfPages);

  const range = (start: number, end: number) => {
    return Array.apply(0, Array(end - start + 1)).map(
      (element, index) => index + start
    );
  };

  const paginationRange = (
    totalNumberOfPages: number,
    currentPage: number,
    numberOfSiblings: number = 1
  ) => {
    let pageNumbersWithEllipsis = 7 + numberOfSiblings;
    if (pageNumbersWithEllipsis >= totalNumberOfPages)
      return range(1, totalNumberOfPages);
    let leftSiblingIndex = Math.max(currentPage - numberOfSiblings, 1);
    let showLeftEllipsis = leftSiblingIndex > 1;
    let rightSiblingIndex = Math.min(
      currentPage + numberOfSiblings,
      totalNumberOfPages
    );
    let showRightEllipsis = rightSiblingIndex < totalNumberOfPages - 1;
    if (!showLeftEllipsis && showRightEllipsis) {
      let leftItemsCount = 3 + 2 * numberOfSiblings;
      let leftItemsRange = range(1, leftItemsCount);
      return [...leftItemsRange, " ...", totalNumberOfPages];
    } else if (showLeftEllipsis && !showRightEllipsis) {
      let rightItemsCount = 3 + 2 * numberOfSiblings;
      let rightItemsRange = range(
        totalNumberOfPages - rightItemsCount + 1,
        totalNumberOfPages
      );
      return [1, "... ", ...rightItemsRange];
    } else {
      let middleItemsRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, "... ", ...middleItemsRange, " ...", totalNumberOfPages];
    }
  };

  let numberOfPages = paginationRange(
    props.totalNumberOfPages,
    props.currentPageNumber
  );

  return (
    <nav className="properties__pagination" aria-label="...">
      <ul className="pagination justify-content-center">
        {props.currentPageNumber === 1 ? (
          ""
        ) : (
          <li
            onClick={() => props.paginate("Previous", 0)}
            className="page-item"
          >
            <a className="page-link" href="#properties-list">
              Previous
            </a>
          </li>
        )}
        {numberOfPages.map((page) => (
          <li
            className={`page-item ${
              props.currentPageNumber === page ? "active" : ""
            }`}
            aria-current="page"
            key={page}
            onClick={() => props.paginate("Change", page)}
          >
            <a className="page-link" href="#properties-list">
              {page}
            </a>
          </li>
        ))}
        {props.currentPageNumber === props.totalNumberOfPages ? (
          ""
        ) : (
          <li className="page-item" onClick={() => props.paginate("Next", 0)}>
            <a className="page-link" href="#properties-list">
              Next
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Pagination;
