import { useReducer, useRef, KeyboardEvent } from "react"
import { motion } from "framer-motion"
import { nanoid } from "nanoid"
import "./style.css"

interface IColumn {
  id: string
  name: string
  projectId: string
}

interface ICard {
  id: string
  name: string
  description: string
  columnId: string
}

interface IProject {
  id: string
  name: string | undefined
}

interface GridState {
  columns: Array<IColumn>
  cards: Array<ICard>
  projects: Array<IProject>
}

interface ProjectAction {
  id: string
  name: string | undefined
  type: string
}

interface ColumnAction {
  id: string
  name: string
  projectId: string
  type: string
}

interface CardAction {
  columnId: string
  description: string
  id: string
  name: string
  type: string
}

type GridAction = ProjectAction | ColumnAction | CardAction

const initialState = {
  columns: [],
  cards: [],
  projects: [],
  ui: {},
}

interface ColumnProps {
  id: string
  name: string
  dispatch(action: GridAction): void
  cards: Array<ICard>
  className: string
}

interface CardProps {
  id: string
  name: string
  dispatch(action: GridAction): void // function declaration
  description: string
}

interface ProjectProps {
  id: string
  name: string | undefined
  columns: Array<IColumn>
  cards: Array<ICard>
  dispatch(action: GridAction): void
}

const gridReducer = (state: GridState, action: GridAction) => {
  switch (action.type) {
    case "ADD_CARD":
    case "REMOVE_CARD":
      return {
        ...state,
        cards: cardReducer(state.cards, action as CardAction),
      }
    case "ADD_COLUMN":
    case "REMOVE_COLUMN":
      return {
        ...state,
        columns: columnReducer(state.columns, action as ColumnAction),
      }
    case "REMOVE_PROJECT":
      return {
        ...state,
        projects: projectReducer(state.projects, action as ProjectAction),
        columns: columnReducer(state.columns, action as ColumnAction),
      }
    case "ADD_PROJECT":
      return {
        ...state,
        projects: projectReducer(state.projects, action as ProjectAction),
      }
    default:
      return state
  }
}

const cardReducer = (state: Array<ICard>, action: CardAction) => {
  switch (action.type) {
    case "ADD_CARD":
      return state.concat({
        id: nanoid(),
        name: action.name,
        description: action.description,
        columnId: action.columnId,
      })

    case "REMOVE_CARD":
      return state.filter(({ id }) => id !== action.id)

    default:
      return state
  }
}

const columnReducer = (state: Array<IColumn>, action: ColumnAction) => {
  switch (action.type) {
    case "REMOVE_PROJECT":
      return state.filter(({ projectId }) => projectId === action.projectId)

    case "ADD_COLUMN":
      return state.concat({
        id: nanoid(),
        name: action.name,
        projectId: action.projectId,
      })

    case "REMOVE_COLUMN":
      return state.filter(({ id }) => id !== action.id)

    default:
      return state
  }
}

const projectReducer = (state: Array<IProject> = [], action: ProjectAction) => {
  switch (action.type) {
    case "ADD_PROJECT":
      return state.concat({ id: nanoid(), name: action.name })

    case "REMOVE_PROJECT":
      return state.filter(({ id }) => id !== action.id)

    case "UPDATE_PROJECT":
      return state.map((p) => {
        if (p.id === action.id) return { ...p, name: action.name }

        return p
      })

    default:
      return state
  }
}

const Column = (props: ColumnProps) => {
  const { id, name, dispatch, cards } = props

  const nameInputRef = useRef<HTMLInputElement>(null)
  const descInputRef = useRef<HTMLInputElement>(null)

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      dispatch({
        type: "ADD_CARD",
        name: nameInputRef?.current?.value,
        description: descInputRef?.current?.value,
        columnId: id,
      } as CardAction)
      if (nameInputRef && nameInputRef.current) nameInputRef.current.value = ""
      if (descInputRef && descInputRef.current) descInputRef.current.value = ""
    }
  }

  return (
    <div className="column" key={`column-${id}`}>
      <label>Add Card to Column {name}</label>
      <input type="text" ref={nameInputRef} />
      <input type="text" ref={descInputRef} onKeyDown={handleKeyPress} />

      <div className="column-name">{name}</div>
      <div className="cards">
        {cards
          .filter(({ columnId }) => columnId === id)
          .map((props) => (
            <Card {...props} dispatch={dispatch} />
          ))}
      </div>
    </div>
  )
}

const Card = (props: CardProps) => {
  const { id, name, description } = props

  return (
    <div key={`card-${id}`} className="card">
      <div className="card-title">{name}</div>
      <div className="card-desc">{description}</div>
    </div>
  )
}

const Project = (props: ProjectProps) => {
  const { id, name, columns, cards, dispatch } = props
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      dispatch({
        type: "ADD_COLUMN",
        name: inputRef?.current?.value,
        projectId: id,
      } as ColumnAction)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div key={`project-${id}`} className="project">
      <div className="project-name">{name}</div>

      <button
        onClick={() =>
          dispatch({ type: "REMOVE_PROJECT", id: id } as ProjectAction)
        }
        className="project-remove"
      >
        Remove
      </button>
      <div className="column-fields">
        <label>Add Column to Project {name}</label>
        <input type="text" ref={inputRef} onKeyDown={handleKeyPress} />

        <div className="columns">
          {columns
            .filter(({ projectId }) => projectId === id)
            .map(({ id, name }) => (
              <Column
                id={id}
                key={`column-${id}`}
                name={name}
                cards={cards}
                dispatch={dispatch}
                className="column"
              />
            ))}
        </div>
      </div>
    </div>
  )
}

const Grid = () => {
  const [state, dispatch] = useReducer(gridReducer, initialState)
  const inputRef = useRef<HTMLInputElement>(null)

  const { columns, cards, projects } = state

  const addProject = (projectName: String | undefined) => {
    dispatch({
      type: "ADD_PROJECT",
      name: projectName,
    } as ProjectAction)
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addProject(inputRef?.current?.value)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  return (
    <div className="projects">
      <h1>Create Project</h1>
      <input
        placeholder="Project name"
        type="text"
        ref={inputRef}
        onKeyDown={handleKeyPress}
      />
      <button onClick={() => addProject(inputRef?.current?.value)}>+</button>
      <div className="project-list">
        {projects.map(({ id, name }) => (
          <motion.div animate="visible" initial="hidden" variants={variants}>
            <Project
              key={`project-${id}`}
              id={id}
              name={name}
              dispatch={dispatch}
              columns={columns}
              cards={cards}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const App = () => <Grid />

export default App
