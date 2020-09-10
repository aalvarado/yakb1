import React, { 
  useReducer, 
  useRef,
  useState, 
  } from "react";
import { motion } from "framer-motion";
import { nanoid } from "nanoid";
import "./style.css";

const gridReducer = (state, action) => {
  console.log(state);

  switch (action.type) {
    case "ADD_CARD":
    case "REMOVE_CARD":
      return {
        ...state,
        cards: cardReducer(state.cards, action),
      };
    case "ADD_COLUMN":
    case "REMOVE_COLUMN":
      return {
        ...state,
        columns: columnReducer(state.columns, action)
      };
    case "REMOVE_PROJECT":
        
            return {
        ...state,
        projects: projectReducer(state.projects, action),
        columns: columnReducer(state.columns, action),
      };
    case "ADD_PROJECT":
      return {
        ...state,
        projects: projectReducer(state.projects, action),
      };
    default:
    return state;
  }
}

const cardReducer = (state, action) => {
  switch (action.type) {
    case "ADD_CARD":
      return state.concat({
        id: nanoid(),
        name: action.name,
        description: action.description,
        columnId: action.columnId,
      })

    case "REMOVE_CARD":
      return state.filter(({ id }) => id !== action.id );

    default: 
      return state;
  }
}

const columnReducer = (state, action) => {
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
        return state.filter(({ id }) => id !== action.id );
    
    default: 
      return state;
  }
}

const projectReducer = (state = [], action) => {
  switch (action.type) {
    case "ADD_PROJECT":
      return state.concat({ id: nanoid(), name: action.name });

    case "REMOVE_PROJECT":
      return state.filter(({ id }) => id !== action.id );

    case "UPDATE_PROJECT":
      return state.map((p) => {
        if (p.id === action.id)
          return { ...p, name: action.name };

        return p
      })
  
    default: 
      return state;
  }
}

const initialState = {
  columns: [],
  cards: [],
  projects: [],
  ui: {}
}

const Column = (props) =>  {
  const {
    id,
    name,
    dispatch,
    cards,
  } = props;

  const nameInputRef = useRef();
  const descInputRef = useRef();

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      dispatch({
        type: 'ADD_CARD',
        name: nameInputRef.current.value,
        description: descInputRef.current.value,
        columnId: id,
      });
      nameInputRef.current.value = "";
      descInputRef.current.value = "";
    }
  }

  return (
    <div className="column" key={`column-${id}`}>
      <label>
        Add Card to Column {name}
      </label>
      <input type="text" ref={nameInputRef}  />
      <input type="text" ref={descInputRef} onKeyPress={handleKeyPress} />

      <div className="column-name">{name}</div>
      <div className="cards">
        { cards.filter(({columnId}) => columnId === id).map((props) => 
          <Card 
            {...props}
            dispatch={dispatch}
          />
        )}
      </div>
    </div>
  )
};

const Card = (props) => {
  const { 
    id, 
    name,
    dispatch,
    description,
  } = props;

  return(
    <div key={`card-${id}`} className="card">
      <div className="card-title">
        {name}
      </div>
      <div className="card-desc">
        {description}
      </div>
    </div>
  )
}

const Project = (props) => {
  const { 
    id, 
    name, 
    columns,
    cards,
    dispatch,
  } = props;
  const inputRef = useRef();

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      dispatch({
        type: 'ADD_COLUMN',
        name: inputRef.current.value,
        projectId: id,
      });
      inputRef.current.value = "";
    }
  }

  return (
    <div
      key={`project-${id}`}
      className="project"
    >
      <div className="project-name">
        {name}
      </div>

      <button
        onClick={() => dispatch({ type: "REMOVE_PROJECT", id: id })}
        className="project-remove"
      >
        Remove
        </button>
      <div className="column-fields">
        <label>
          Add Column to Project {name}
        </label>
        <input type="text" ref={inputRef} onKeyPress={handleKeyPress} />

        <div className="columns">
            { columns.filter(({projectId}) => projectId === id).map(({id, name}) => 
            <Column 
              id={id}
              key={`column-${id}`}
              name={name}
              cards={cards}
              dispatch={dispatch}
              className="column"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const Grid = (props) => {
  const [state, dispatch] = useReducer(gridReducer, initialState);
  const inputRef = useRef(null);

  const {
    columns, 
    cards,
    projects,
  } = state;

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      dispatch({ 
        type: "ADD_PROJECT", 
        name: inputRef.current.value,
      });
      inputRef.current.value = "";
    }
  }

  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  return (
    <div className="projects">
      <h1>Create Project</h1>
      <input type="text" ref={inputRef} onKeyPress={handleKeyPress} />
      <div className="project-list">
        { projects.map(({id, name}) =>
          <motion.div 
            animate="visible"
            initial="hidden"
            variants={variants}
          >
            <Project
              key={`project-${id}`}
              id={id}
              name={name}
              dispatch={dispatch}
              columns={columns}
              cards={cards}
            />
          </motion.div>
        ) } 
      </div>
  </div>
  );
}

const App = () => <Grid />;

export default App;