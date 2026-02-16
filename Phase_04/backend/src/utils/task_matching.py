"""
Task matching utility for fuzzy title matching.

Provides fuzzy matching for task titles to enable natural language
task references in chat conversations.
"""
from typing import List, Optional, Union
from ..models.task import Task


def fuzzy_match_task(
    tasks: List[Task],
    query: str
) -> Union[Task, List[Task], None]:
    """
    Find task(s) by fuzzy title match.

    This function performs case-insensitive substring matching to find
    tasks that match the user's reference. It handles:
    - Partial title matches
    - Case-insensitive matching
    - Ambiguity detection (multiple matches)

    Args:
        tasks: List of tasks to search through
        query: The search query (partial or full task title)

    Returns:
        - Task: Single match found
        - List[Task]: Multiple matches (ambiguous - needs clarification)
        - None: No match found

    Examples:
        >>> fuzzy_match_task(tasks, "buy groceries")
        Task(title="Buy groceries tomorrow")  # Single match

        >>> fuzzy_match_task(tasks, "meeting")
        [Task(title="Team meeting"), Task(title="Client meeting")]  # Ambiguous

        >>> fuzzy_match_task(tasks, "nonexistent")
        None  # No match
    """
    if not tasks or not query:
        return None

    query_lower = query.lower().strip()
    matches = []

    for task in tasks:
        task_title_lower = task.title.lower()

        # Check if query is contained in task title (substring match)
        if query_lower in task_title_lower:
            matches.append(task)

    if len(matches) == 1:
        # Single match - return the task
        return matches[0]
    elif len(matches) > 1:
        # Multiple matches - return list for clarification
        return matches
    else:
        # No matches found
        return None


def format_task_options(tasks: List[Task]) -> str:
    """
    Format a list of tasks as options for user selection.

    Used when multiple tasks match and user needs to clarify.

    Args:
        tasks: List of tasks to format

    Returns:
        Formatted string with numbered task options
    """
    if not tasks:
        return "No tasks available."

    options = []
    for i, task in enumerate(tasks, 1):
        status = "✓" if task.is_completed else "○"
        options.append(f"{i}. {status} {task.title}")

    return "\n".join(options)


def find_best_match(tasks: List[Task], query: str) -> Optional[Task]:
    """
    Find the best matching task using scoring.

    Scores matches based on:
    - Exact match (100 points)
    - Starts with query (80 points)
    - Contains query (60 points)
    - Length similarity (bonus)

    Args:
        tasks: List of tasks to search
        query: Search query

    Returns:
        Best matching task or None if no matches
    """
    if not tasks or not query:
        return None

    query_lower = query.lower().strip()
    best_task = None
    best_score = 0

    for task in tasks:
        task_title_lower = task.title.lower()
        score = 0

        # Exact match
        if task_title_lower == query_lower:
            score = 100
        # Starts with query
        elif task_title_lower.startswith(query_lower):
            score = 80
        # Contains query
        elif query_lower in task_title_lower:
            score = 60

        # Add length similarity bonus (closer lengths get bonus)
        if score > 0:
            len_diff = abs(len(task_title_lower) - len(query_lower))
            score += max(0, 20 - len_diff)

        if score > best_score:
            best_score = score
            best_task = task

    return best_task


__all__ = ["fuzzy_match_task", "format_task_options", "find_best_match"]
